# Flutter to React Native Migration Guide - AI Fitness Coach

## Overview
This document provides a comprehensive guide for migrating the AI Fitness Coach app from Flutter to React Native with a Python backend.

## Migration Strategy

### Phase 1: Backend Setup
- Create FastAPI backend to handle API calls and data persistence
- Move OpenAI API integration to backend for security
- Implement proper authentication and session management
- Set up PostgreSQL database for data storage

### Phase 2: React Native Setup
- Initialize React Native project with TypeScript
- Set up development environment and dependencies
- Configure navigation and state management
- Implement core UI components with glassmorphism

### Phase 3: Feature Migration
- Migrate authentication flow
- Implement AI coach functionality
- Build workout management system
- Add drag & drop scheduling
- Implement theme system

## Technology Stack Mapping

### Core Framework
| Flutter | React Native |
|---------|--------------|
| Flutter SDK | React Native 0.73+ |
| Dart | TypeScript |
| Material Design | React Native Elements / NativeBase |
| Cupertino | React Native iOS components |

### State Management
| Flutter | React Native |
|---------|--------------|
| Riverpod | Zustand (recommended) |
| StateNotifier | Zustand stores |
| Provider | React Context + Zustand |
| ChangeNotifier | useState/useReducer |

### Navigation
| Flutter | React Native |
|---------|--------------|
| go_router | React Navigation 6 |
| GoRoute | Stack/Tab/Drawer navigators |
| path parameters | route params |
| guards | navigation guards |

### UI Components
| Flutter | React Native |
|---------|--------------|
| Container | View |
| Text | Text |
| Image | Image/FastImage |
| ListView | FlatList/ScrollView |
| GestureDetector | TouchableOpacity |
| glass_kit | react-native-blur + custom |

### Storage & Database
| Flutter | React Native |
|---------|--------------|
| shared_preferences | AsyncStorage |
| sqflite | react-native-sqlite-storage |
| path_provider | react-native-fs |

### Networking
| Flutter | React Native |
|---------|--------------|
| dio | axios |
| http | fetch API |
| web_socket_channel | react-native-websocket |

### Platform Features
| Flutter | React Native |
|---------|--------------|
| flutter_tts | react-native-tts |
| google_speech | @react-native-voice/voice |
| health | react-native-health |
| flutter_local_notifications | react-native-push-notification |

### Animations
| Flutter | React Native |
|---------|--------------|
| AnimationController | react-native-reanimated |
| Hero animations | react-native-shared-element |
| lottie | lottie-react-native |
| implicit animations | Animated API |

### Charts & Visualizations
| Flutter | React Native |
|---------|--------------|
| fl_chart | react-native-chart-kit |
| charts_flutter | victory-native |
| custom painters | react-native-svg |

### Development Tools
| Flutter | React Native |
|---------|--------------|
| flutter_dotenv | react-native-config |
| logger | react-native-logs |
| flutter_test | Jest + React Native Testing Library |

## File Structure Mapping

### Flutter Structure
```
ai_fitness_coach/
├── lib/
│   ├── main.dart
│   ├── config/
│   ├── core/
│   ├── data/
│   ├── domain/
│   ├── presentation/
│   ├── providers/
│   ├── services/
│   └── utils/
├── assets/
├── android/
├── ios/
└── pubspec.yaml
```

### React Native Structure
```
AIFitnessCoach/
├── src/
│   ├── App.tsx
│   ├── navigation/
│   ├── screens/
│   ├── components/
│   ├── services/
│   ├── store/
│   ├── types/
│   ├── utils/
│   └── constants/
├── assets/
├── android/
├── ios/
├── package.json
└── backend/
    ├── app.py
    ├── api/
    ├── models/
    ├── services/
    └── requirements.txt
```

## Code Pattern Mappings

### Widget/Component Structure

**Flutter:**
```dart
class MyWidget extends StatelessWidget {
  final String title;
  
  const MyWidget({Key? key, required this.title}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text(title),
    );
  }
}
```

**React Native:**
```typescript
interface MyComponentProps {
  title: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};
```

### State Management

**Flutter (Riverpod):**
```dart
final userProvider = StateNotifierProvider<UserNotifier, UserModel?>((ref) {
  return UserNotifier(ref.watch(databaseProvider));
});

class UserNotifier extends StateNotifier<UserModel?> {
  UserNotifier(this._db) : super(null);
  
  Future<void> login(String email, String password) async {
    // login logic
    state = user;
  }
}
```

**React Native (Zustand):**
```typescript
interface UserStore {
  user: UserModel | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  login: async (email, password) => {
    // login logic
    set({ user });
  },
  logout: () => set({ user: null }),
}));
```

### Navigation

**Flutter (go_router):**
```dart
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => LoginScreen(),
    ),
  ],
);
```

**React Native (React Navigation):**
```typescript
const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
```

### Async Operations

**Flutter:**
```dart
Future<void> fetchData() async {
  try {
    final response = await dio.get('/api/data');
    setState(() {
      data = response.data;
    });
  } catch (e) {
    print('Error: $e');
  }
}
```

**React Native:**
```typescript
const fetchData = async () => {
  try {
    const response = await axios.get('/api/data');
    setData(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Glassmorphism Implementation

**Flutter:**
```dart
GlassContainer(
  blur: 10,
  color: Colors.white.withOpacity(0.1),
  borderRadius: BorderRadius.circular(15),
  child: content,
)
```

**React Native:**
```typescript
import { BlurView } from '@react-native-community/blur';

const GlassContainer = ({ children, style }) => (
  <View style={[styles.container, style]}>
    <BlurView
      style={StyleSheet.absoluteFillObject}
      blurType="light"
      blurAmount={10}
    />
    <View style={styles.content}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: 16,
  },
});
```

## API Service Migration

**Flutter Service:**
```dart
class AICoachService {
  final String apiKey;
  
  Future<String> getCoachResponse(String message) async {
    final response = await dio.post(
      'https://api.openai.com/v1/chat/completions',
      data: {
        'model': 'gpt-4',
        'messages': [{'role': 'user', 'content': message}],
      },
      options: Options(headers: {'Authorization': 'Bearer $apiKey'}),
    );
    return response.data['choices'][0]['message']['content'];
  }
}
```

**React Native + Python Backend:**

**Frontend (React Native):**
```typescript
class AICoachService {
  async getCoachResponse(message: string): Promise<string> {
    const response = await axios.post('/api/coach/chat', {
      message,
    });
    return response.data.response;
  }
}
```

**Backend (Python FastAPI):**
```python
from fastapi import FastAPI, HTTPException
from openai import OpenAI

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.post("/api/coach/chat")
async def coach_chat(request: ChatRequest):
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": get_coach_prompt(request.personality)},
                {"role": "user", "content": request.message}
            ]
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Platform-Specific Code

**Flutter:**
```dart
if (Platform.isIOS) {
  // iOS specific code
} else if (Platform.isAndroid) {
  // Android specific code
}
```

**React Native:**
```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // iOS specific code
} else if (Platform.OS === 'android') {
  // Android specific code
}
```

## Testing Migration

**Flutter:**
```dart
testWidgets('Login button test', (WidgetTester tester) async {
  await tester.pumpWidget(MyApp());
  expect(find.text('Login'), findsOneWidget);
  await tester.tap(find.text('Login'));
  await tester.pump();
});
```

**React Native:**
```typescript
import { render, fireEvent } from '@testing-library/react-native';

test('Login button test', () => {
  const { getByText } = render(<LoginScreen />);
  const loginButton = getByText('Login');
  expect(loginButton).toBeTruthy();
  fireEvent.press(loginButton);
});
```

## Performance Considerations

1. **Image Loading**: Replace `CachedNetworkImage` with `react-native-fast-image`
2. **List Performance**: Use `FlatList` with proper optimization props
3. **Animation Performance**: Use `react-native-reanimated` for 60fps animations
4. **Navigation Performance**: Enable native stack navigator for better transitions

## Common Pitfalls to Avoid

1. **State Management**: Don't use setState equivalent, use proper state management
2. **Navigation**: Don't use imperative navigation, use React Navigation's declarative approach
3. **Styling**: Remember React Native uses flexbox by default, not like Flutter's constraints
4. **Platform Differences**: Test thoroughly on both platforms, behaviors can differ
5. **Performance**: Profile early and often, React Native performance needs attention

## Migration Checklist

- [ ] Set up Python backend with FastAPI
- [ ] Create database schema in PostgreSQL
- [ ] Implement authentication endpoints
- [ ] Move OpenAI integration to backend
- [ ] Initialize React Native project
- [ ] Set up TypeScript configuration
- [ ] Install and configure all dependencies
- [ ] Create navigation structure
- [ ] Implement state management
- [ ] Migrate all screens
- [ ] Implement glassmorphism components
- [ ] Add drag & drop functionality
- [ ] Integrate with backend APIs
- [ ] Test on iOS and Android
- [ ] Performance optimization
- [ ] Production build configuration