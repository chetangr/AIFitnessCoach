import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { VisionGlass } from './VisionGlass';
import { FloatingElement } from './FloatingElement';
import { spatialHaptics } from '../../services/spatialHaptics';

const { width, height } = Dimensions.get('window');

interface FormPoint {
  id: string;
  x: number; // Percentage of screen width
  y: number; // Percentage of screen height
  type: 'joint' | 'alignment' | 'angle' | 'center_of_mass';
  status: 'correct' | 'warning' | 'error';
  message: string;
  confidence: number; // 0-1
}

interface FormAnalysisData {
  overallScore: number; // 0-100
  status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  points: FormPoint[];
  suggestions: string[];
  exercise: string;
}

interface FormAnalysisOverlayProps {
  isActive: boolean;
  analysisData?: FormAnalysisData;
  onToggle: () => void;
  onFormCorrection?: (correction: string) => void;
}

export const FormAnalysisOverlay: React.FC<FormAnalysisOverlayProps> = ({
  isActive,
  analysisData,
  onToggle,
  onFormCorrection,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<FormPoint | null>(null);

  // Animation values
  const overlayOpacity = useSharedValue(isActive ? 1 : 0);
  const scanProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    overlayOpacity.value = withTiming(isActive ? 1 : 0, { duration: 300 });
    
    if (isActive) {
      // Start scanning animation
      scanProgress.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        false
      );
      
      // Pulse animation for active analysis
      pulseScale.value = withRepeat(
        withSpring(1.1, { damping: 15 }),
        -1,
        true
      );
    } else {
      scanProgress.value = withTiming(0);
      pulseScale.value = withTiming(1);
    }
  }, [isActive]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    pointerEvents: overlayOpacity.value > 0 ? 'auto' : 'none',
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scanProgress.value,
          [0, 1],
          [-height, height]
        ),
      },
    ],
    opacity: interpolate(
      scanProgress.value,
      [0, 0.1, 0.9, 1],
      [0, 1, 1, 0]
    ),
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return ['#4CAF50', '#81C784'];
      case 'good': return ['#8BC34A', '#AED581'];
      case 'needs_improvement': return ['#FF9800', '#FFB74D'];
      case 'poor': return ['#F44336', '#E57373'];
      case 'correct': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return ['#667eea', '#764ba2'];
    }
  };

  const handlePointPress = (point: FormPoint) => {
    spatialHaptics.formCorrect();
    setSelectedPoint(point);
    onFormCorrection?.(point.message);
  };

  const renderFormPoint = (point: FormPoint, index: number) => {
    const colors = getStatusColor(point.status);
    
    return (
      <FloatingElement key={point.id} variant="subtle" depth={1}>
        <Animated.View
          style={[
            styles.formPoint,
            {
              left: `${point.x}%`,
              top: `${point.y}%`,
              backgroundColor: Array.isArray(colors) ? colors[0] : colors,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => handlePointPress(point)}
            style={styles.formPointButton}
          >
            <VisionGlass variant="thick" style={styles.formPointContent}>
              <Icon
                name={
                  point.type === 'joint' ? 'radio-button-on' :
                  point.type === 'alignment' ? 'remove' :
                  point.type === 'angle' ? 'trending-up' :
                  'locate'
                }
                size={12}
                color="white"
              />
              
              {/* Confidence ring */}
              <View style={[styles.confidenceRing, {
                borderColor: Array.isArray(colors) ? colors[0] : colors,
                opacity: point.confidence,
              }]} />
              
              {/* Pulse effect for errors */}
              {point.status === 'error' && (
                <Animated.View
                  style={[
                    styles.pulseRing,
                    {
                      borderColor: Array.isArray(colors) ? colors[0] : colors,
                      transform: [{ scale: pulseScale.value }],
                    },
                  ]}
                />
              )}
            </VisionGlass>
          </TouchableOpacity>
        </Animated.View>
      </FloatingElement>
    );
  };

  const renderAnalysisSummary = () => {
    if (!analysisData) return null;
    
    const colors = getStatusColor(analysisData.status);
    
    return (
      <FloatingElement variant="pronounced" depth={1}>
        <VisionGlass variant="thick" floating style={styles.summaryCard}>
          <LinearGradient
            colors={Array.isArray(colors) ? colors : [colors, colors]}
            style={styles.summaryHeader}
          >
            <Text style={styles.summaryTitle}>Form Analysis</Text>
            <Text style={styles.summaryScore}>{analysisData.overallScore}%</Text>
          </LinearGradient>
          
          <View style={styles.summaryContent}>
            <View style={styles.statusRow}>
              <Icon
                name={
                  analysisData.status === 'excellent' ? 'checkmark-circle' :
                  analysisData.status === 'good' ? 'checkmark' :
                  analysisData.status === 'needs_improvement' ? 'warning' :
                  'close-circle'
                }
                size={20}
                color={Array.isArray(colors) ? colors[0] : colors}
              />
              <Text style={styles.statusText}>
                {analysisData.status.charAt(0).toUpperCase() + analysisData.status.slice(1).replace('_', ' ')}
              </Text>
            </View>
            
            <Text style={styles.exerciseText}>Exercise: {analysisData.exercise}</Text>
            
            <TouchableOpacity
              onPress={() => setShowDetails(!showDetails)}
              style={styles.detailsButton}
            >
              <Text style={styles.detailsButtonText}>
                {showDetails ? 'Hide' : 'Show'} Details
              </Text>
              <Icon
                name={showDetails ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>
          </View>
        </VisionGlass>
      </FloatingElement>
    );
  };

  const renderDetailedAnalysis = () => {
    if (!showDetails || !analysisData) return null;
    
    return (
      <FloatingElement variant="subtle" depth={2}>
        <VisionGlass variant="light" style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Suggestions:</Text>
          
          {analysisData.suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionRow}>
              <View style={[styles.suggestionDot, { 
                backgroundColor: getStatusColor(analysisData.status)[0] as string 
              }]} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
          
          <View style={styles.pointsSummary}>
            <Text style={styles.pointsSummaryTitle}>Analysis Points:</Text>
            {analysisData.points.map((point, index) => (
              <TouchableOpacity
                key={point.id}
                onPress={() => handlePointPress(point)}
                style={styles.pointSummaryRow}
              >
                <Icon
                  name="location"
                  size={12}
                  color={getStatusColor(point.status) as string}
                />
                <Text style={styles.pointSummaryText}>
                  {point.type.replace('_', ' ')}: {point.message}
                </Text>
                <Text style={styles.confidenceText}>
                  {Math.round(point.confidence * 100)}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </VisionGlass>
      </FloatingElement>
    );
  };

  const renderSelectedPointDetail = () => {
    if (!selectedPoint) return null;
    
    return (
      <FloatingElement variant="pronounced" depth={1}>
        <VisionGlass variant="thick" floating style={styles.pointDetailCard}>
          <View style={styles.pointDetailHeader}>
            <Icon
              name="close"
              size={20}
              color="white"
              onPress={() => setSelectedPoint(null)}
            />
          </View>
          
          <Text style={styles.pointDetailTitle}>
            {selectedPoint.type.replace('_', ' ').toUpperCase()}
          </Text>
          
          <Text style={styles.pointDetailMessage}>
            {selectedPoint.message}
          </Text>
          
          <View style={styles.pointDetailMeta}>
            <View style={[styles.statusIndicator, {
              backgroundColor: getStatusColor(selectedPoint.status) as string,
            }]} />
            <Text style={styles.pointDetailStatus}>
              {selectedPoint.status.toUpperCase()}
            </Text>
            <Text style={styles.pointDetailConfidence}>
              {Math.round(selectedPoint.confidence * 100)}% confidence
            </Text>
          </View>
        </VisionGlass>
      </FloatingElement>
    );
  };

  if (!isActive) return null;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      {/* Scanning line effect */}
      <Animated.View style={[styles.scanLine, scanLineStyle]} />
      
      {/* Grid overlay for reference */}
      <View style={styles.gridOverlay}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={`h${i}`}
            style={[styles.gridLine, styles.horizontalGrid, {
              top: `${(i + 1) * 20}%`,
            }]}
          />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={`v${i}`}
            style={[styles.gridLine, styles.verticalGrid, {
              left: `${(i + 1) * 25}%`,
            }]}
          />
        ))}
      </View>
      
      {/* Form analysis points */}
      {analysisData?.points.map((point, index) => renderFormPoint(point, index))}
      
      {/* Analysis summary */}
      <View style={styles.summaryContainer}>
        {renderAnalysisSummary()}
      </View>
      
      {/* Detailed analysis */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          {renderDetailedAnalysis()}
        </View>
      )}
      
      {/* Selected point detail */}
      {selectedPoint && (
        <View style={styles.pointDetailContainer}>
          {renderSelectedPointDetail()}
        </View>
      )}
      
      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        <FloatingElement variant="subtle" depth={1}>
          <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
            <VisionGlass variant="thick" interactive>
              <Icon name="close" size={24} color="white" />
            </VisionGlass>
          </TouchableOpacity>
        </FloatingElement>
      </View>
    </Animated.View>
  );
};

// Sample form analysis data
export const sampleFormAnalysis: FormAnalysisData = {
  overallScore: 78,
  status: 'good',
  exercise: 'Push-ups',
  points: [
    {
      id: 'head_alignment',
      x: 50,
      y: 20,
      type: 'alignment',
      status: 'correct',
      message: 'Head in neutral position - excellent!',
      confidence: 0.95,
    },
    {
      id: 'shoulder_position',
      x: 45,
      y: 35,
      type: 'joint',
      status: 'warning',
      message: 'Shoulders slightly forward - engage upper back',
      confidence: 0.87,
    },
    {
      id: 'elbow_angle',
      x: 35,
      y: 45,
      type: 'angle',
      status: 'error',
      message: 'Elbows too wide - keep closer to body',
      confidence: 0.92,
    },
    {
      id: 'hip_alignment',
      x: 50,
      y: 60,
      type: 'alignment',
      status: 'correct',
      message: 'Hips in line with body - perfect form',
      confidence: 0.98,
    },
    {
      id: 'center_mass',
      x: 50,
      y: 50,
      type: 'center_of_mass',
      status: 'good',
      message: 'Center of mass stable',
      confidence: 0.85,
    },
  ],
  suggestions: [
    'Keep elbows closer to your body (45° angle)',
    'Engage your core throughout the movement',
    'Focus on controlled, steady breathing',
    'Maintain straight line from head to heels',
  ],
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(102,126,234,0.1)',
  },
  horizontalGrid: {
    left: 0,
    right: 0,
    height: 1,
  },
  verticalGrid: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  formPoint: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  formPointButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  formPointContent: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  confidenceRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    top: -4,
    left: -4,
  },
  pulseRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    top: -8,
    left: -8,
    opacity: 0.6,
  },
  summaryContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  summaryCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryScore: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryContent: {
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  exerciseText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 12,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  detailsButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginRight: 4,
  },
  detailsContainer: {
    position: 'absolute',
    top: 200,
    left: 20,
    right: 20,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 12,
  },
  detailsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suggestionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    marginRight: 8,
  },
  suggestionText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    flex: 1,
    lineHeight: 16,
  },
  pointsSummary: {
    marginTop: 16,
  },
  pointsSummaryTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pointSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pointSummaryText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    flex: 1,
    marginLeft: 6,
  },
  confidenceText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
  },
  pointDetailContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  pointDetailCard: {
    padding: 16,
    borderRadius: 12,
  },
  pointDetailHeader: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  pointDetailTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pointDetailMessage: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
  },
  pointDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  pointDetailStatus: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
  },
  pointDetailConfidence: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  controlsContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});