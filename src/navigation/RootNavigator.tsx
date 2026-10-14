import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useApp } from '../context/AppContext';
import { CreateAccountScreen } from '../screens/auth/CreateAccountScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { CycleSetupScreen } from '../screens/onboarding/CycleSetupScreen';
import { ModeSelectScreen } from '../screens/onboarding/ModeSelectScreen';
import { PregnancySetupScreen } from '../screens/onboarding/PregnancySetupScreen';
import { CalendarScreen } from '../screens/period/CalendarScreen';
import { InsightsScreen } from '../screens/period/InsightsScreen';
import { LogEntryScreen } from '../screens/period/LogEntryScreen';
import { PeriodHomeScreen } from '../screens/period/PeriodHomeScreen';
import { AppointmentsScreen } from '../screens/pregnancy/AppointmentsScreen';
import { TeenCarePlanScreen } from '../screens/teen/TeenCarePlanScreen';
import { HydrationScreen } from '../screens/pregnancy/HydrationScreen';
import { WeekGuideScreen } from '../screens/pregnancy/BabyUpdatesScreen';
import { PregnancyInsightsScreen } from '../screens/pregnancy/PregnancyInsightsScreen';
import { PregnancyCalendarScreen } from '../screens/pregnancy/PregnancyCalendarScreen';
import { PregnancyHomeScreen } from '../screens/pregnancy/PregnancyHomeScreen';
import { LegalScreen } from '../screens/auth/LegalScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { HelpScreen } from '../screens/settings/HelpScreen';
import { PrivacyScreen } from '../screens/settings/PrivacyScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { DobPrompt } from '../screens/auth/DobPrompt';
import { TeenArticleScreen } from '../screens/teen/TeenArticleScreen';
import { TeenCheckInScreen } from '../screens/teen/TeenCheckInScreen';
import { TeenYouScreen } from '../screens/teen/TeenYouScreen';
import { TeenHomeScreen } from '../screens/teen/TeenHomeScreen';
import { TeenLearnScreen } from '../screens/teen/TeenLearnScreen';
import { colors, fonts } from '../theme';
import { isTeenBirthDate } from '../utils/age';

const RootStack = createNativeStackNavigator();
const AuthNav = createNativeStackNavigator();
const PeriodStack = createNativeStackNavigator();
const PregnancyStack = createNativeStackNavigator();
const TeenStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.canvas,
    card: colors.white,
    text: colors.ink,
    primary: colors.rose,
    border: colors.blushDeep,
  },
};

function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <View
      style={{
        width: 32,
        height: 26,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? colors.petal : 'transparent',
      }}
    >
      <Ionicons name={name} color={color} size={18} />
    </View>
  );
}

const tabOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.rose,
  tabBarInactiveTintColor: colors.inkSoft,
  tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 10 },
  tabBarStyle: {
    backgroundColor: colors.white,
    borderTopColor: '#F3E4E9',
    height: 74,
    paddingTop: 8,
    paddingBottom: 8,
  },
};

function openLog(navigation: { getParent: () => { navigate: (name: string) => void } | undefined }) {
  return {
    tabPress: (event: { preventDefault: () => void }) => {
      event.preventDefault();
      navigation.getParent()?.navigate('LogEntry');
    },
  };
}

function PeriodTabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="Today" component={PeriodHomeScreen} options={{ tabBarIcon: tabIcon('home-outline') }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarIcon: tabIcon('calendar-outline') }} />
      <Tab.Screen
        name="Log"
        component={PeriodHomeScreen}
        listeners={({ navigation }) => openLog(navigation)}
        options={{ tabBarIcon: tabIcon('add-circle-outline') }}
      />
      <Tab.Screen name="Insights" component={InsightsScreen} options={{ tabBarIcon: tabIcon('stats-chart-outline') }} />
      <Tab.Screen name="You" component={SettingsScreen} options={{ tabBarIcon: tabIcon('person-outline') }} />
    </Tab.Navigator>
  );
}

function PregnancyTabs() {
  const { landOnBaby, clearLandOnBaby } = useApp();
  const initialRoute = useRef(landOnBaby ? 'Insights' : 'Today').current;
  useEffect(() => {
    if (landOnBaby) clearLandOnBaby();
  }, [landOnBaby, clearLandOnBaby]);

  return (
    <Tab.Navigator initialRouteName={initialRoute} screenOptions={{ ...tabOptions, freezeOnBlur: false }}>
      <Tab.Screen name="Today" component={PregnancyHomeScreen} options={{ tabBarIcon: tabIcon('home-outline') }} />
      <Tab.Screen name="Calendar" component={PregnancyCalendarScreen} options={{ tabBarIcon: tabIcon('calendar-outline') }} />
      <Tab.Screen
        name="Log"
        component={PregnancyHomeScreen}
        listeners={({ navigation }) => openLog(navigation)}
        options={{ tabBarIcon: tabIcon('add-circle-outline') }}
      />
      <Tab.Screen name="Insights" component={PregnancyInsightsScreen} options={{ tabBarIcon: tabIcon('stats-chart-outline') }} />
      <Tab.Screen name="You" component={SettingsScreen} options={{ tabBarIcon: tabIcon('person-outline') }} />
    </Tab.Navigator>
  );
}

function TeenCalendar() {
  const { mode, pregnancy } = useApp();
  if (mode === 'pregnancy' && pregnancy) return <PregnancyCalendarScreen />;
  return <CalendarScreen />;
}

function TeenTabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="Today" component={TeenHomeScreen} options={{ tabBarIcon: tabIcon('home-outline') }} />
      <Tab.Screen name="Calendar" component={TeenCalendar} options={{ tabBarIcon: tabIcon('calendar-outline') }} />
      <Tab.Screen name="Log" component={TeenCheckInScreen} options={{ tabBarIcon: tabIcon('add-circle-outline') }} />
      <Tab.Screen name="Insights" component={TeenLearnScreen} options={{ tabBarIcon: tabIcon('stats-chart-outline') }} />
      <Tab.Screen name="You" component={SettingsScreen} options={{ tabBarIcon: tabIcon('person-outline') }} />
    </Tab.Navigator>
  );
}

function TeenApp() {
  return (
    <TeenStack.Navigator screenOptions={{ headerShown: false }}>
      <TeenStack.Screen name="TeenTabs" component={TeenTabs} />
      <TeenStack.Screen name="Article" component={TeenArticleScreen} />
      <TeenStack.Screen name="Guide" component={WeekGuideScreen} />
      <TeenStack.Screen name="Appointments" component={TeenCarePlanScreen} />
      <TeenStack.Screen name="Hydration" component={HydrationScreen} />
      <TeenStack.Screen name="TeenMode" component={TeenYouScreen} />
      <TeenStack.Screen name="Privacy" component={PrivacyScreen} />
      <TeenStack.Screen name="Help" component={HelpScreen} />
    </TeenStack.Navigator>
  );
}

function AuthStack() {
  return (
    <AuthNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthNav.Screen name="Welcome" component={WelcomeScreen} />
      <AuthNav.Screen name="SignIn" component={SignInScreen} />
      <AuthNav.Screen name="CreateAccount" component={CreateAccountScreen} />
      <AuthNav.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <AuthNav.Screen name="Legal" component={LegalScreen} />
    </AuthNav.Navigator>
  );
}

function PeriodApp() {
  return (
    <PeriodStack.Navigator screenOptions={{ headerShown: false }}>
      <PeriodStack.Screen name="PeriodTabs" component={PeriodTabs} />
      <PeriodStack.Screen name="LogEntry" component={LogEntryScreen} />
      <PeriodStack.Screen name="Privacy" component={PrivacyScreen} />
      <PeriodStack.Screen name="Help" component={HelpScreen} />
    </PeriodStack.Navigator>
  );
}

function PregnancyApp() {
  return (
    <PregnancyStack.Navigator screenOptions={{ headerShown: false }}>
      <PregnancyStack.Screen name="PregnancyTabs" component={PregnancyTabs} />
      <PregnancyStack.Screen name="Guide" component={WeekGuideScreen} />
      <PregnancyStack.Screen name="Appointments" component={AppointmentsScreen} />
      <PregnancyStack.Screen name="Hydration" component={HydrationScreen} />
      <PregnancyStack.Screen name="LogEntry" component={LogEntryScreen} />
      <PregnancyStack.Screen name="Privacy" component={PrivacyScreen} />
      <PregnancyStack.Screen name="Help" component={HelpScreen} />
    </PregnancyStack.Navigator>
  );
}

export function RootNavigator() {
  const { user, mode, cycle, pregnancy } = useApp();
  const teen = isTeenBirthDate(user?.birthDate);

  let screen: React.ReactNode;
  if (!user) {
    screen = <RootStack.Screen name="Auth" component={AuthStack} />;
  } else if (teen && !cycle) {
    screen = <RootStack.Screen name="CycleSetup" component={CycleSetupScreen} />;
  } else if (teen) {
    screen = <RootStack.Screen name="TeenApp" component={TeenApp} />;
  } else if (!mode) {
    screen = <RootStack.Screen name="Mode" component={ModeSelectScreen} />;
  } else if (mode === 'period' && !cycle) {
    screen = <RootStack.Screen name="CycleSetup" component={CycleSetupScreen} />;
  } else if (mode === 'pregnancy' && !pregnancy) {
    screen = <RootStack.Screen name="PregnancySetup" component={PregnancySetupScreen} />;
  } else if (mode === 'period') {
    screen = <RootStack.Screen name="PeriodApp" component={PeriodApp} />;
  } else {
    screen = <RootStack.Screen name="PregnancyApp" component={PregnancyApp} />;
  }

  const stage = !user
    ? 'auth'
    : teen
      ? cycle
        ? mode === 'pregnancy' && pregnancy
          ? 'teen-pregnancy'
          : 'teen'
        : 'teen-setup'
      : !mode
      ? 'mode'
      : mode === 'period'
        ? cycle
          ? 'period'
          : 'cycle-setup'
        : pregnancy
          ? 'pregnancy'
          : 'pregnancy-setup';

  return (
    <>
      <NavigationContainer key={stage} theme={navTheme}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>{screen}</RootStack.Navigator>
      </NavigationContainer>
      <DobPrompt />
    </>
  );
}
