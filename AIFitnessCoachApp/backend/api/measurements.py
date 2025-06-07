"""Body measurements and progress photos API endpoints."""
from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import uuid
import os
import aiofiles

from services.async_database import get_db
from services.auth_service import get_current_user_id
from models.measurements import BodyMeasurement, ProgressPhoto
from schemas.measurements import (
    BodyMeasurementCreate,
    BodyMeasurementResponse,
    BodyMeasurementUpdate,
    ProgressPhotoResponse,
    MeasurementTrends
)

router = APIRouter(tags=["measurements"])

# Body Measurements Endpoints

@router.post("", response_model=BodyMeasurementResponse)
async def create_measurement(
    measurement: BodyMeasurementCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Record a new body measurement."""
    # For now, we'll create a simplified measurement entry
    # In a real app, you'd create multiple BodyMeasurement entries for each measurement type
    
    measurement_data = measurement.model_dump(exclude_unset=True)
    
    # Create a weight measurement if provided
    if 'weight' in measurement_data and measurement_data['weight'] is not None:
        from models.measurements import MeasurementType
        db_measurement = BodyMeasurement(
            user_id=user_id,
            measurement_type=MeasurementType.WEIGHT,
            value=measurement_data['weight'],
            unit='kg',  # Default to kg, should be configurable
            notes=measurement_data.get('notes', '')
        )
        db.add(db_measurement)
        await db.commit()
        await db.refresh(db_measurement)
        
        # Return a response that matches the schema
        return BodyMeasurementResponse(
            id=str(db_measurement.id),
            user_id=str(db_measurement.user_id),
            weight=db_measurement.value,
            notes=db_measurement.notes,
            recorded_at=db_measurement.measured_at,
            created_at=db_measurement.created_at,
            updated_at=db_measurement.created_at
        )
    
    # If no weight provided, return an error
    raise HTTPException(status_code=400, detail="At least one measurement value must be provided")

@router.get("", response_model=List[BodyMeasurementResponse])
async def get_measurements(
    limit: int = 30,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get measurement history for the current user."""
    # Handle demo user
    if user_id == "demo-user-001":
        from datetime import timedelta
        # Return sample measurements for demo user
        demo_measurements = []
        base_weight = 75.5
        for i in range(min(5, limit)):
            measured_at = datetime.utcnow() - timedelta(days=i*3)
            demo_measurements.append(BodyMeasurementResponse(
                id=f"demo-measurement-{i+1}",
                user_id=user_id,
                measurement_type="weight",
                value=base_weight - (i * 0.3),
                unit="kg",
                notes=f"Morning weight - Day {i+1}",
                measured_at=measured_at,
                recorded_at=measured_at,  # Add the required recorded_at field
                created_at=measured_at,
                updated_at=measured_at
            ))
        return demo_measurements[offset:offset+limit]
    
    query = select(BodyMeasurement).where(
        BodyMeasurement.user_id == user_id
    ).order_by(desc(BodyMeasurement.recorded_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    measurements = result.scalars().all()
    return measurements

@router.get("/latest", response_model=Optional[BodyMeasurementResponse])
async def get_latest_measurement(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get the most recent measurement."""
    query = select(BodyMeasurement).where(
        BodyMeasurement.user_id == user_id
    ).order_by(desc(BodyMeasurement.recorded_at)).limit(1)
    
    result = await db.execute(query)
    measurement = result.scalar_one_or_none()
    return measurement

@router.get("/trends", response_model=MeasurementTrends)
async def get_measurement_trends(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get measurement trends and statistics."""
    # Get measurements from the last N days
    query = select(BodyMeasurement).where(
        BodyMeasurement.user_id == user_id
    ).order_by(desc(BodyMeasurement.measured_at)).limit(days)
    
    result = await db.execute(query)
    measurements = result.scalars().all()
    
    if not measurements:
        return MeasurementTrends(
            weight_trend=[],
            body_fat_trend=[],
            measurements_trend={},
            total_weight_change=0,
            total_body_fat_change=0,
            average_weekly_change=0
        )
    
    # Group measurements by type for trends
    from models.measurements import MeasurementType
    weight_measurements = [m for m in measurements if m.measurement_type == MeasurementType.WEIGHT]
    body_fat_measurements = [m for m in measurements if m.measurement_type == MeasurementType.BODY_FAT]
    
    # Calculate trends
    weight_trend = [{"date": m.measured_at, "value": m.value} for m in weight_measurements]
    body_fat_trend = [{"date": m.measured_at, "value": m.value} for m in body_fat_measurements]
    
    # Calculate changes
    total_weight_change = 0
    if len(weight_measurements) >= 2:
        latest_weight = weight_measurements[0]
        oldest_weight = weight_measurements[-1]
        total_weight_change = latest_weight.value - oldest_weight.value
    
    total_body_fat_change = 0
    if len(body_fat_measurements) >= 2:
        latest_bf = body_fat_measurements[0]
        oldest_bf = body_fat_measurements[-1]
        total_body_fat_change = latest_bf.value - oldest_bf.value
    
    # Calculate weekly average
    average_weekly_change = 0
    if weight_measurements and len(weight_measurements) >= 2:
        days_diff = (weight_measurements[0].measured_at.date() - weight_measurements[-1].measured_at.date()).days
        if days_diff > 0:
            average_weekly_change = (total_weight_change / days_diff) * 7
    
    return MeasurementTrends(
        weight_trend=weight_trend,
        body_fat_trend=body_fat_trend,
        measurements_trend={
            "waist": [{"date": m.recorded_at, "value": m.waist_circumference} for m in measurements if m.waist_circumference],
            "chest": [{"date": m.recorded_at, "value": m.chest_circumference} for m in measurements if m.chest_circumference],
            "arms": [{"date": m.recorded_at, "value": m.arm_circumference} for m in measurements if m.arm_circumference],
        },
        total_weight_change=total_weight_change,
        total_body_fat_change=total_body_fat_change,
        average_weekly_change=average_weekly_change
    )

@router.delete("/measurements/{measurement_id}")
async def delete_measurement(
    measurement_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a measurement."""
    query = select(BodyMeasurement).where(
        BodyMeasurement.id == measurement_id,
        BodyMeasurement.user_id == user_id
    )
    result = await db.execute(query)
    measurement = result.scalar_one_or_none()
    
    if not measurement:
        raise HTTPException(status_code=404, detail="Measurement not found")
    
    await db.delete(measurement)
    await db.commit()
    
    return {"message": "Measurement deleted successfully"}

# Progress Photos Endpoints

UPLOAD_DIR = "uploads/progress_photos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/progress-photos", response_model=ProgressPhotoResponse)
async def upload_progress_photo(
    file: UploadFile = File(...),
    angle: str = Form(...),
    notes: Optional[str] = Form(None),
    is_private: bool = Form(True),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Upload a progress photo."""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    filename = f"{user_id}_{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    # Create database entry
    db_photo = ProgressPhoto(
        user_id=user_id,
        photo_url=f"/uploads/progress_photos/{filename}",
        angle=angle,
        notes=notes,
        is_private=is_private
    )
    db.add(db_photo)
    await db.commit()
    await db.refresh(db_photo)
    
    return db_photo

@router.get("/progress-photos", response_model=List[ProgressPhotoResponse])
async def get_progress_photos(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's progress photo gallery."""
    query = select(ProgressPhoto).where(
        ProgressPhoto.user_id == user_id
    ).order_by(desc(ProgressPhoto.taken_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    photos = result.scalars().all()
    return photos

@router.get("/progress-photos/{photo_id}", response_model=ProgressPhotoResponse)
async def get_progress_photo(
    photo_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific progress photo."""
    query = select(ProgressPhoto).where(
        ProgressPhoto.id == photo_id,
        ProgressPhoto.user_id == user_id
    )
    result = await db.execute(query)
    photo = result.scalar_one_or_none()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    return photo

@router.put("/progress-photos/{photo_id}/privacy")
async def update_photo_privacy(
    photo_id: str,
    is_private: bool,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Update photo privacy settings."""
    query = select(ProgressPhoto).where(
        ProgressPhoto.id == photo_id,
        ProgressPhoto.user_id == user_id
    )
    result = await db.execute(query)
    photo = result.scalar_one_or_none()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    photo.is_private = is_private
    await db.commit()
    
    return {"message": "Privacy settings updated successfully"}

@router.delete("/progress-photos/{photo_id}")
async def delete_progress_photo(
    photo_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a progress photo."""
    query = select(ProgressPhoto).where(
        ProgressPhoto.id == photo_id,
        ProgressPhoto.user_id == user_id
    )
    result = await db.execute(query)
    photo = result.scalar_one_or_none()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Delete file from disk
    if photo.photo_url.startswith("/uploads/"):
        file_path = photo.photo_url[1:]  # Remove leading slash
        if os.path.exists(file_path):
            os.remove(file_path)
    
    await db.delete(photo)
    await db.commit()
    
    return {"message": "Photo deleted successfully"}