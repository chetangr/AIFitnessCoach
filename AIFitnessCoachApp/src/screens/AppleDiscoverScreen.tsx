import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ImageBackground,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../config/theme';
import { useStaggeredEntrance, useFadeIn, useParallaxScroll } from '../utils/animations';
import { GlassContainer, GlassBadge, GlassSectionHeader } from '../components/glass/GlassComponents';
import { useThemeStore } from '../store/themeStore';

const { width } = Dimensions.get('window');

interface MeditationItem {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  type: string;
  image: string;
  isNew?: boolean;
}

interface ActivityType {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string[];
}

interface Program {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  duration: string;
  difficulty: string;
  gradient: string[];
}

const AppleDiscoverScreen = ({ navigation }: any) => {
  const { theme: themeFromStore } = useThemeStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useFadeIn(0, 300);
  const parallaxTransform = useParallaxScroll(scrollY, 0.5);
  
  // Sample data
  const meditations: MeditationItem[] = [
    {
      id: '1',
      title: 'Meditation with Gregg',
      instructor: 'Gregg',
      duration: '5min',
      type: 'Creativity',
      image: 'meditation1',
      isNew: true,
    },
    {
      id: '2',
      title: 'Meditation with Jonelle',
      instructor: 'Jonelle',
      duration: '5min',
      type: 'Sleep',
      image: 'meditation2',
      isNew: true,
    },
    {
      id: '3',
      title: 'Mindful Breathing',
      instructor: 'Jessica',
      duration: '10min',
      type: 'Focus',
      image: 'meditation3',
    },
  ];

  const activityTypes: ActivityType[] = [
    {
      id: '1',
      name: 'Yoga',
      icon: 'body',
      color: '#4CD964',
      gradient: ['#4CD964', '#2ECC40'],
    },
    {
      id: '2',
      name: 'Core',
      icon: 'fitness',
      color: '#FF9500',
      gradient: ['#FF9500', '#FF6B35'],
    },
    {
      id: '3',
      name: 'Pilates',
      icon: 'body',
      color: '#5856D6',
      gradient: ['#5856D6', '#7C4DFF'],
    },
    {
      id: '4',
      name: 'Strength',
      icon: 'barbell',
      color: '#FF3B30',
      gradient: ['#FF3B30', '#FF1744'],
    },
  ];

  const programs: Program[] = [
    {
      id: '1',
      title: '3 Perfect Weeks of Strength',
      subtitle: 'Express Edition',
      image: 'strength',
      duration: '3 weeks',
      difficulty: 'Intermediate',
      gradient: ['#A8E063', '#56AB2F'],
    },
    {
      id: '2',
      title: 'Get Strong',
      subtitle: 'Build muscle and power',
      image: 'muscle',
      duration: '4 weeks',
      difficulty: 'Advanced',
      gradient: ['#FF6B6B', '#C44569'],
    },
    {
      id: '3',
      title: 'Mindful Movement',
      subtitle: 'Yoga and meditation journey',
      image: 'yoga',
      duration: '30 days',
      difficulty: 'All Levels',
      gradient: ['#667eea', '#764ba2'],
    },
  ];

  const collections = [
    { id: '1', title: 'Artist Spotlight', count: 12 },
    { id: '2', title: 'Get Fit for 2025', count: 8 },
    { id: '3', title: 'Quick Workouts', count: 15 },
    { id: '4', title: 'Recovery Sessions', count: 6 },
  ];

  const staggerAnimations = useStaggeredEntrance(4, 200);

  const renderMeditation = ({ item }: { item: MeditationItem }) => (
    <TouchableOpacity 
      style={styles.meditationCard}
      onPress={() => navigation.navigate('WorkoutDetail', { workout: item })}
    >
      <ImageBackground
        source={{ uri: 'https://via.placeholder.com/200x150' }}
        style={styles.meditationImage}
        imageStyle={styles.meditationImageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.meditationGradient}
        >
          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          <View style={styles.meditationContent}>
            <Text style={[styles.meditationTitle, theme.typography.headline]}>
              {item.title}
            </Text>
            <Text style={[styles.meditationType, theme.typography.footnote]}>
              {item.duration} • {item.type}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderActivityType = ({ item, index }: { item: ActivityType; index: number }) => (
    <Animated.View
      style={[
        {
          opacity: staggerAnimations[index],
          transform: [
            {
              translateY: staggerAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.activityCard}
        onPress={() => navigation.navigate('WorkoutsScreen', { category: item.name })}
      >
        <LinearGradient
          colors={item.gradient as [string, string]}
          style={styles.activityGradient}
        >
          <Icon name={item.icon} size={40} color="white" />
          <Text style={[styles.activityName, theme.typography.headline]}>
            {item.name}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderProgram = ({ item }: { item: Program }) => (
    <TouchableOpacity
      style={styles.programCard}
      onPress={() => navigation.navigate('ProgramDetail', { program: item })}
    >
      <ImageBackground
        source={{ uri: 'https://via.placeholder.com/350x200' }}
        style={styles.programImage}
        imageStyle={styles.programImageStyle}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
          style={styles.programGradient}
        >
          <View style={styles.programContent}>
            <Text style={[styles.programTitle, theme.typography.title2]}>
              {item.title}
            </Text>
            <Text style={[styles.programSubtitle, theme.typography.callout]}>
              {item.subtitle}
            </Text>
            <View style={styles.programMeta}>
              <GlassBadge label={item.duration} icon="calendar" />
              <GlassBadge label={item.difficulty} variant="warning" />
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderCollection = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.collectionItem}>
      <GlassContainer style={styles.collectionCard} intensity="light">
        <Text style={[styles.collectionTitle, theme.typography.headline]}>
          {item.title}
        </Text>
        <Text style={[styles.collectionCount, theme.typography.footnote]}>
          {item.count} workouts
        </Text>
      </GlassContainer>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={themeFromStore.colors.primary.gradient as [string, string, string]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <View style={styles.tabs}>
            <TouchableOpacity style={styles.tab}>
              <Text style={[styles.tabText, theme.typography.headline]}>For You</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Text style={[styles.tabText, styles.activeTabText, theme.typography.headline]}>
                Explore
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Text style={[styles.tabText, theme.typography.headline]}>Library</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Icon name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Meditations Section */}
        <Animated.View style={{ transform: [{ translateY: parallaxTransform }] }}>
          <GlassSectionHeader
            title="Meditations"
            subtitle="New and picked for you"
          />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={meditations}
            renderItem={renderMeditation}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalList}
          />
        </Animated.View>

        {/* Activity Types */}
        <View style={styles.section}>
          <GlassSectionHeader title="Activity Types" />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={activityTypes}
            renderItem={renderActivityType}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Programs */}
        <View style={styles.section}>
          <GlassSectionHeader
            title="Programs"
            subtitle="Created to help you improve your fitness, prepare for new adventures, and focus on mindfulness"
            action={{
              label: 'Show All',
              onPress: () => navigation.navigate('AllPrograms'),
            }}
          />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            data={programs}
            renderItem={renderProgram}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Collections */}
        <View style={styles.section}>
          <GlassSectionHeader title="Collections" />
          <View style={styles.collectionsGrid}>
            {collections.map((item) => (
              <View key={item.id} style={styles.collectionWrapper}>
                {renderCollection({ item })}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    flex: 1,
  },
  tab: {
    marginRight: theme.spacing.xl,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary.purple,
  },
  tabText: {
    color: theme.colors.neutral.gray500,
    paddingBottom: theme.spacing.xs,
  },
  activeTabText: {
    color: 'white',
  },
  searchButton: {
    padding: theme.spacing.sm,
  },
  scrollContent: {
    paddingTop: 120,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  horizontalList: {
    paddingHorizontal: theme.spacing.md,
  },
  
  // Meditation styles
  meditationCard: {
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  meditationImage: {
    width: 200,
    height: 150,
  },
  meditationImageStyle: {
    borderRadius: theme.borderRadius.lg,
  },
  meditationGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
  },
  meditationContent: {
    marginTop: theme.spacing.xs,
  },
  meditationTitle: {
    color: 'white',
    fontWeight: '600',
  },
  meditationType: {
    color: theme.colors.neutral.gray300,
    marginTop: theme.spacing.xs,
  },
  newBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  newBadgeText: {
    color: theme.colors.neutral.gray900,
    fontSize: 10,
    fontWeight: '700',
  },
  
  // Activity types
  activityCard: {
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  activityGradient: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityName: {
    color: 'white',
    marginTop: theme.spacing.sm,
    fontWeight: '600',
  },
  
  // Programs
  programCard: {
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    width: width - 40,
    ...theme.shadows.lg,
  },
  programImage: {
    width: '100%',
    height: 200,
  },
  programImageStyle: {
    borderRadius: theme.borderRadius.xl,
  },
  programGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: theme.spacing.lg,
  },
  programContent: {
    marginTop: theme.spacing.md,
  },
  programTitle: {
    color: 'white',
    fontWeight: '700',
  },
  programSubtitle: {
    color: theme.colors.neutral.gray300,
    marginTop: theme.spacing.xs,
  },
  programMeta: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  
  // Collections
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
  },
  collectionWrapper: {
    width: '50%',
    paddingRight: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  collectionItem: {
    flex: 1,
  },
  collectionCard: {
    padding: theme.spacing.md,
    minHeight: 80,
    justifyContent: 'center',
  },
  collectionTitle: {
    color: theme.colors.neutral.gray900,
    fontWeight: '600',
  },
  collectionCount: {
    color: theme.colors.neutral.gray600,
    marginTop: theme.spacing.xs,
  },
});

export default AppleDiscoverScreen;