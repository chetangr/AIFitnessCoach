import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../store/authStore';
import { 
  LiquidGlassView, 
  LiquidButton, 
  LiquidCard,
  LiquidEmptyState,
  LiquidLoading,
  showLiquidAlert
} from '../components/glass';

const { width } = Dimensions.get('window');

interface LiquidProgressPhotosScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

interface ProgressPhoto {
  id: string;
  uri: string;
  date: string;
  weight?: number;
  notes?: string;
  measurements?: {
    chest?: number;
    waist?: number;
    arms?: number;
  };
}

interface PhotoGroup {
  date: string;
  photos: ProgressPhoto[];
}

const LiquidProgressPhotosScreen: React.FC<LiquidProgressPhotosScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'comparison'>('grid');

  // Mock data with placeholder for demo
  const mockPhotos: ProgressPhoto[] = [];

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      // Group photos by date
      const grouped = groupPhotosByMonth(mockPhotos);
      setPhotoGroups(grouped);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupPhotosByMonth = (photos: ProgressPhoto[]): PhotoGroup[] => {
    const groups: { [key: string]: ProgressPhoto[] } = {};
    
    photos.forEach(photo => {
      const date = new Date(photo.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(photo);
    });

    return Object.entries(groups).map(([date, photos]) => ({
      date,
      photos: photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  };

  const pickImage = async (useCamera: boolean) => {
    const permissionResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showLiquidAlert(
        'Permission Required',
        `Please allow ${useCamera ? 'camera' : 'photo library'} access to add progress photos.`
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Add the new photo
      const newPhoto: ProgressPhoto = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        date: new Date().toISOString(),
        weight: (user as any)?.currentWeight || 0,
      };

      // Update state
      const updatedPhotos = [newPhoto, ...mockPhotos];
      const grouped = groupPhotosByMonth(updatedPhotos);
      setPhotoGroups(grouped);

      showLiquidAlert('Success', 'Photo uploaded successfully!');
    }
  };

  const renderPhoto = ({ item }: { item: ProgressPhoto }) => (
    <TouchableOpacity
      onPress={() => setSelectedPhoto(item)}
      style={styles.photoContainer}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.uri }} style={styles.photo} />
      <LiquidGlassView style={styles.photoOverlay} intensity={85}>
        <Text style={styles.photoDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        {item.weight && (
          <Text style={styles.photoWeight}>{item.weight} kg</Text>
        )}
      </LiquidGlassView>
    </TouchableOpacity>
  );

  const renderPhotoGroup = ({ item }: { item: PhotoGroup }) => (
    <View style={styles.groupContainer}>
      <Text style={styles.groupTitle}>{item.date}</Text>
      <FlatList
        data={item.photos}
        renderItem={renderPhoto}
        keyExtractor={photo => photo.id}
        numColumns={3}
        columnWrapperStyle={styles.photoRow}
        scrollEnabled={false}
      />
    </View>
  );

  const renderComparison = () => {
    if (photoGroups.length === 0 || photoGroups[0].photos.length < 2) {
      return (
        <LiquidEmptyState
          icon="images-outline"
          title="Need More Photos"
          message="Add at least 2 photos to compare your progress"
        />
      );
    }

    const firstPhoto = photoGroups[photoGroups.length - 1].photos[0];
    const latestPhoto = photoGroups[0].photos[0];

    return (
      <ScrollView style={styles.comparisonContainer}>
        <LiquidCard style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>Progress Comparison</Text>
          
          <View style={styles.comparisonImages}>
            <View style={styles.comparisonImageContainer}>
              <View style={[styles.comparisonImage, styles.placeholderImage]}>
                <Icon name="image-outline" size={40} color="#666" />
              </View>
              <Text style={styles.comparisonLabel}>Start</Text>
              <Text style={styles.comparisonDate}>
                {new Date(firstPhoto.date).toLocaleDateString()}
              </Text>
              {firstPhoto.weight && (
                <Text style={styles.comparisonWeight}>{firstPhoto.weight} kg</Text>
              )}
            </View>

            <Icon name="arrow-forward" size={24} color="#FFF" style={styles.arrow} />

            <View style={styles.comparisonImageContainer}>
              <View style={[styles.comparisonImage, styles.placeholderImage]}>
                <Icon name="image-outline" size={40} color="#666" />
              </View>
              <Text style={styles.comparisonLabel}>Current</Text>
              <Text style={styles.comparisonDate}>
                {new Date(latestPhoto.date).toLocaleDateString()}
              </Text>
              {latestPhoto.weight && (
                <Text style={styles.comparisonWeight}>{latestPhoto.weight} kg</Text>
              )}
            </View>
          </View>

          {firstPhoto.weight && latestPhoto.weight && (
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatLabel}>Weight Change</Text>
                <Text style={[
                  styles.progressStatValue,
                  { color: latestPhoto.weight < firstPhoto.weight ? '#4CD964' : '#FF3B30' }
                ]}>
                  {(latestPhoto.weight - firstPhoto.weight).toFixed(1)} kg
                </Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatLabel}>Duration</Text>
                <Text style={styles.progressStatValue}>
                  {Math.ceil((new Date(latestPhoto.date).getTime() - new Date(firstPhoto.date).getTime()) / (1000 * 60 * 60 * 24))} days
                </Text>
              </View>
            </View>
          )}
        </LiquidCard>
      </ScrollView>
    );
  };

  if (isLoading) {
    return <LiquidLoading message="Loading progress photos..." />;
  }

  return (
    <LiquidGlassView style={styles.container} intensity={95}>
      {/* Header */}
      <LiquidGlassView style={styles.header} intensity={90}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Progress Photos</Text>
        <TouchableOpacity
          onPress={() => showLiquidAlert('Success', 'Progress updated successfully!')}
          style={styles.addButton}
        >
          <Icon name="add-circle-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </LiquidGlassView>

      {/* View Mode Selector */}
      <View style={styles.viewModeSelector}>
        <TouchableOpacity
          onPress={() => setViewMode('grid')}
          style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
        >
          <LiquidGlassView 
            style={styles.viewModeGlass}
            intensity={viewMode === 'grid' ? 90 : 70}
          >
            <Icon name="grid-outline" size={20} color={viewMode === 'grid' ? '#FFF' : '#AAA'} />
            <Text style={[styles.viewModeText, viewMode === 'grid' && styles.viewModeTextActive]}>
              Gallery
            </Text>
          </LiquidGlassView>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setViewMode('comparison')}
          style={[styles.viewModeButton, viewMode === 'comparison' && styles.viewModeButtonActive]}
        >
          <LiquidGlassView 
            style={styles.viewModeGlass}
            intensity={viewMode === 'comparison' ? 90 : 70}
          >
            <Icon name="git-compare-outline" size={20} color={viewMode === 'comparison' ? '#FFF' : '#AAA'} />
            <Text style={[styles.viewModeText, viewMode === 'comparison' && styles.viewModeTextActive]}>
              Compare
            </Text>
          </LiquidGlassView>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === 'grid' ? (
        photoGroups.length === 0 ? (
          <LiquidEmptyState
            icon="camera-outline"
            title="No Progress Photos"
            message="Start documenting your fitness journey by adding your first photo"
          />
        ) : (
          <FlatList
            data={photoGroups}
            renderItem={renderPhotoGroup}
            keyExtractor={item => item.date}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FFF"
              />
            }
          />
        )
      ) : (
        renderComparison()
      )}

      {/* Selected Photo Modal */}
      {selectedPhoto && (
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setSelectedPhoto(null)}
          activeOpacity={1}
        >
          <LiquidGlassView style={styles.modalContent} intensity={95}>
            <View style={[styles.modalImage, styles.placeholderImage]}>
              <Icon name="image-outline" size={60} color="#666" />
            </View>
            <View style={styles.modalInfo}>
              <Text style={styles.modalDate}>
                {new Date(selectedPhoto.date).toLocaleDateString()}
              </Text>
              {selectedPhoto.weight && (
                <Text style={styles.modalWeight}>Weight: {selectedPhoto.weight} kg</Text>
              )}
              {selectedPhoto.notes && (
                <Text style={styles.modalNotes}>{selectedPhoto.notes}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setSelectedPhoto(null)}
              style={styles.modalClose}
            >
              <Icon name="close-circle" size={32} color="#FFF" />
            </TouchableOpacity>
          </LiquidGlassView>
        </TouchableOpacity>
      )}
    </LiquidGlassView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  addButton: {
    padding: 8,
  },
  viewModeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  viewModeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  viewModeButtonActive: {
    transform: [{ scale: 1.02 }],
  },
  viewModeGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewModeText: {
    fontSize: 14,
    color: '#AAA',
    marginLeft: 8,
    fontWeight: '500',
  },
  viewModeTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  photoRow: {
    justifyContent: 'space-between',
  },
  photoContainer: {
    width: (width - 48) / 3,
    height: (width - 48) / 3,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
  },
  photoDate: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  photoWeight: {
    fontSize: 10,
    color: '#AAA',
  },
  comparisonContainer: {
    flex: 1,
    padding: 16,
  },
  comparisonCard: {
    padding: 20,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  comparisonImages: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  comparisonImageContainer: {
    alignItems: 'center',
    flex: 0.45,
  },
  comparisonImage: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 12,
    marginBottom: 8,
  },
  comparisonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  comparisonDate: {
    fontSize: 12,
    color: '#AAA',
  },
  comparisonWeight: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginTop: 4,
  },
  arrow: {
    alignSelf: 'center',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 4,
  },
  progressStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    aspectRatio: 3/4,
    resizeMode: 'cover',
  },
  modalInfo: {
    padding: 20,
  },
  modalDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  modalWeight: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 8,
  },
  modalNotes: {
    fontSize: 14,
    color: '#AAA',
    fontStyle: 'italic',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  placeholderImage: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LiquidProgressPhotosScreen;