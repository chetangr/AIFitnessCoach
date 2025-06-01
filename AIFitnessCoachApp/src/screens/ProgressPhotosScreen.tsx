import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const ProgressPhotosScreen = ({ navigation }: any) => {
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [photos] = useState([
    {
      id: 1,
      date: '2024-05-01',
      type: 'Front',
      thumbnail: 'https://via.placeholder.com/200x300',
    },
    {
      id: 2,
      date: '2024-05-01',
      type: 'Side',
      thumbnail: 'https://via.placeholder.com/200x300',
    },
    {
      id: 3,
      date: '2024-05-15',
      type: 'Front',
      thumbnail: 'https://via.placeholder.com/200x300',
    },
    {
      id: 4,
      date: '2024-05-15',
      type: 'Side',
      thumbnail: 'https://via.placeholder.com/200x300',
    },
  ]);

  const handleTakePhoto = () => {
    Alert.alert(
      'Take Progress Photo',
      'Choose photo type:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Front View', onPress: () => console.log('Taking front photo') },
        { text: 'Side View', onPress: () => console.log('Taking side photo') },
        { text: 'Back View', onPress: () => console.log('Taking back photo') },
      ]
    );
  };

  const groupPhotosByDate = () => {
    const grouped: Record<string, any[]> = {};
    photos.forEach(photo => {
      if (!grouped[photo.date]) {
        grouped[photo.date] = [];
      }
      grouped[photo.date].push(photo);
    });
    return grouped;
  };

  const groupedPhotos = groupPhotosByDate();

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Photos</Text>
        <TouchableOpacity onPress={handleTakePhoto} style={styles.addButton}>
          <Icon name="camera" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <BlurView intensity={20} style={styles.infoCard}>
          <Icon name="information-circle-outline" size={24} color="white" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Take consistent progress photos to track your transformation journey. Best taken in similar lighting and poses.
          </Text>
        </BlurView>

        {Object.entries(groupedPhotos).reverse().map(([date, datePhotos]) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            
            <View style={styles.photosGrid}>
              {datePhotos.map((photo) => (
                <TouchableOpacity 
                  key={photo.id} 
                  style={styles.photoCard}
                  onPress={() => {
                    setSelectedPhoto(photo);
                    setPhotoViewerVisible(true);
                  }}
                >
                  <BlurView intensity={20} style={styles.photoContainer}>
                    <View style={styles.photoPlaceholder}>
                      <Icon name="image-outline" size={40} color="rgba(255,255,255,0.6)" />
                      <Text style={styles.photoType}>{photo.type}</Text>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ))}
              
              {/* Add photo button */}
              <TouchableOpacity style={styles.photoCard} onPress={handleTakePhoto}>
                <BlurView intensity={15} style={styles.photoContainer}>
                  <View style={styles.addPhotoPlaceholder}>
                    <Icon name="add-circle-outline" size={40} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Empty state if no photos */}
        {photos.length === 0 && (
          <BlurView intensity={20} style={styles.emptyState}>
            <Icon name="camera-outline" size={64} color="rgba(255,255,255,0.6)" />
            <Text style={styles.emptyTitle}>No Progress Photos Yet</Text>
            <Text style={styles.emptySubtitle}>Start documenting your fitness journey</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleTakePhoto}>
              <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.emptyButtonGradient}>
                <Icon name="camera" size={20} color="white" />
                <Text style={styles.emptyButtonText}>Take First Photo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        )}
      </ScrollView>

      {/* Photo Viewer Modal */}
      <Modal
        visible={photoViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPhotoViewerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground}
            onPress={() => setPhotoViewerVisible(false)}
          >
            <View style={styles.photoViewerContainer}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setPhotoViewerVisible(false)}
              >
                <Icon name="close" size={28} color="white" />
              </TouchableOpacity>
              
              {selectedPhoto && (
                <View style={styles.photoViewerContent}>
                  <View style={styles.fullPhotoPlaceholder}>
                    <Icon name="image-outline" size={100} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.fullPhotoText}>
                      {selectedPhoto.type} - {new Date(selectedPhoto.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </LinearGradient>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  photoContainer: {
    aspectRatio: 3/4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoType: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  addPhotoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 8,
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalBackground: {
    flex: 1,
  },
  photoViewerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoViewerContent: {
    width: '100%',
    aspectRatio: 3/4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  fullPhotoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPhotoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ProgressPhotosScreen;