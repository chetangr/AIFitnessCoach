import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const programs = [
  {
    id: '1',
    title: '12 Week Transformation',
    description: 'Complete body transformation program',
    duration: '12 weeks',
    level: 'Intermediate',
    image: 'https://via.placeholder.com/300x200',
    trainer: 'Mike Johnson',
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Beginner Strength',
    description: 'Build foundational strength',
    duration: '8 weeks',
    level: 'Beginner',
    image: 'https://via.placeholder.com/300x200',
    trainer: 'Sarah Davis',
    rating: 4.9,
  },
  {
    id: '3',
    title: 'HIIT Shred',
    description: 'High intensity fat burning',
    duration: '6 weeks',
    level: 'Advanced',
    image: 'https://via.placeholder.com/300x200',
    trainer: 'Alex Chen',
    rating: 4.7,
  },
];

const muscleGroups = [
  { id: '1', name: 'Chest', icon: '💪' },
  { id: '2', name: 'Back', icon: '🔙' },
  { id: '3', name: 'Shoulders', icon: '🦾' },
  { id: '4', name: 'Arms', icon: '💪' },
  { id: '5', name: 'Legs', icon: '🦵' },
  { id: '6', name: 'Core', icon: '🎯' },
];

const EnhancedDiscoverScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState('programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');

  const renderProgram = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.programCard}
      onPress={() => navigation.navigate('ActiveWorkout', { 
        workout: {
          name: item.title,
          description: item.description,
          duration: item.duration,
          level: item.level,
          trainer: item.trainer,
          rating: item.rating
        }
      })}
    >
      <Image source={{ uri: item.image }} style={styles.programImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.programGradient}
      >
        <View style={styles.programInfo}>
          <Text style={styles.programTitle}>{item.title}</Text>
          <Text style={styles.programDescription}>{item.description}</Text>
          <View style={styles.programMeta}>
            <View style={styles.metaItem}>
              <Icon name="time-outline" size={14} color="#fff" />
              <Text style={styles.metaText}>{item.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="bar-chart-outline" size={14} color="#fff" />
              <Text style={styles.metaText}>{item.level}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.metaText}>{item.rating}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>10,000+ Exercises & Programs</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'programs' && styles.activeTab]}
          onPress={() => setActiveTab('programs')}
        >
          <Text style={[styles.tabText, activeTab === 'programs' && styles.activeTabText]}>
            Programs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'exercises' && styles.activeTab]}
          onPress={() => setActiveTab('exercises')}
        >
          <Text style={[styles.tabText, activeTab === 'exercises' && styles.activeTabText]}>
            Exercises
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <BlurView intensity={20} tint="light" style={styles.searchBar}>
          <Icon name="search" size={20} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </BlurView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'programs' ? (
          <>
            <Text style={styles.sectionTitle}>Featured Programs</Text>
            <FlatList
              horizontal
              data={programs}
              renderItem={renderProgram}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.programList}
            />

            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <View style={styles.categoryGrid}>
              {['Strength', 'Cardio', 'Yoga', 'Flexibility'].map((category) => (
                <TouchableOpacity 
                  key={category} 
                  style={styles.categoryCard}
                  onPress={() => {
                    setSearchQuery(category);
                    console.log(`Filter by category: ${category}`);
                  }}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.categoryGradient}
                  >
                    <Text style={styles.categoryText}>{category}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Filter by Muscle Group</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleFilter}>
              <TouchableOpacity
                style={[styles.muscleChip, selectedMuscle === 'all' && styles.muscleChipActive]}
                onPress={() => setSelectedMuscle('all')}
              >
                <Text style={[styles.muscleChipText, selectedMuscle === 'all' && styles.muscleChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {muscleGroups.map((muscle) => (
                <TouchableOpacity
                  key={muscle.id}
                  style={[styles.muscleChip, selectedMuscle === muscle.id && styles.muscleChipActive]}
                  onPress={() => setSelectedMuscle(muscle.id)}
                >
                  <Text style={styles.muscleIcon}>{muscle.icon}</Text>
                  <Text style={[styles.muscleChipText, selectedMuscle === muscle.id && styles.muscleChipTextActive]}>
                    {muscle.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Exercise Library</Text>
            <View style={styles.exerciseGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.exerciseCard}
                  onPress={() => navigation.navigate('ExerciseLibrary')}
                >
                  <BlurView intensity={80} tint="light" style={styles.exerciseContent}>
                    <View style={styles.exerciseIcon}>
                      <Icon name="fitness" size={30} color="#667eea" />
                    </View>
                    <Text style={styles.exerciseName}>Exercise {i}</Text>
                    <Text style={styles.exerciseMuscle}>Primary muscle</Text>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        {/* Bottom spacing for floating tab bar */}
        <View style={{ height: Platform.OS === 'ios' ? 90 : 80 }} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  programList: {
    paddingLeft: 20,
  },
  programCard: {
    width: width * 0.7,
    height: 200,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  programImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  programGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 15,
  },
  programInfo: {
    
  },
  programTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  programDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    height: 80,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  categoryGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  muscleFilter: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  muscleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
  },
  muscleChipActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  muscleIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  muscleChipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  muscleChipTextActive: {
    color: '#fff',
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 90 : 80,
  },
  exerciseCard: {
    width: '48%',
    height: 120,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  exerciseContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseIcon: {
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  exerciseMuscle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default EnhancedDiscoverScreen;