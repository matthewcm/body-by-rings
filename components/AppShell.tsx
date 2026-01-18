'use client';

import CustomWorkoutScreen from '@/features/custom-workout-screen/custom-workout-screen';
import Dashboard from '@/features/dashboard-screen/dashboard-screen';
import DiaryScreen from '@/features/diary-screen/diary-screen';
import PlanScreen from '@/features/plan-screen/plan';
import ProfileScreen from '@/features/profile-screen/profile-screen';
import StatsScreen from '@/features/stats-screen/stats-screen';
import WorkoutScreen from '@/features/workout-screen/workout-screen';
import { ConvexClientProvider } from '@/lib/convex-provider';
import { ClerkProvider, SignIn, useAuth } from '@clerk/nextjs';
import { IonApp, IonContent, IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { barbell, calendar, home, person, statsChart } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';

setupIonicReact();

function AppContent() {
  const { isLoaded, userId } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isLoaded || !isClient) {
    return null;
  }

  if (!userId) {
    return (
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/">
              <IonPage>
                <IonContent className="ion-padding" fullscreen>
                  <div className="sign-in-container mx-auto w-full">
                    <SignIn />
                  </div>
                </IonContent>
              </IonPage>
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/">
              <IonPage>
                <IonContent className="ion-padding" fullscreen>
                  <Dashboard />
                </IonContent>
              </IonPage>
            </Route>
            
            <Route exact path="/diary">
              <IonPage>
                <IonContent className="ion-padding" fullscreen>
                  <DiaryScreen />
                </IonContent>
              </IonPage>
            </Route>
            
            <Route exact path="/plan">
              <IonPage>
                <IonContent className="ion-padding" fullscreen>
                  <PlanScreen />
                </IonContent>
              </IonPage>
            </Route>
            
            <Route exact path="/stats">
              <IonPage>
                <IonContent className="ion-padding" fullscreen>
                  <StatsScreen />
                </IonContent>
              </IonPage>
            </Route>
            
            <Route exact path="/profile">
              <IonPage>
                <IonContent className="ion-padding" fullscreen>
                  <ProfileScreen />
                </IonContent>
              </IonPage>
            </Route>
            
            <Route exact path="/workout/:phase/:day">
              <IonPage>
                <IonContent className="ion-padding" fullscreen>
                  <WorkoutScreen />
                </IonContent>
              </IonPage>
            </Route>
            
            <Route exact path="/custom-workout">
              <IonPage>
                <IonContent className="ion-padding" fullscreen>
                  <CustomWorkoutScreen />
                </IonContent>
              </IonPage>
            </Route>
            
            <Redirect from="/app" to="/" />
          </IonRouterOutlet>
          
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/">
              <IonIcon aria-hidden="true" icon={home} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            
            <IonTabButton tab="diary" href="/diary">
              <IonIcon aria-hidden="true" icon={calendar} />
              <IonLabel>Diary</IonLabel>
            </IonTabButton>
            
            <IonTabButton tab="plan" href="/plan">
              <IonIcon aria-hidden="true" icon={barbell} />
              <IonLabel>Plan</IonLabel>
            </IonTabButton>
            
            <IonTabButton tab="stats" href="/stats">
              <IonIcon aria-hidden="true" icon={statsChart} />
              <IonLabel>Stats</IonLabel>
            </IonTabButton>
            
            <IonTabButton tab="profile" href="/profile">
              <IonIcon aria-hidden="true" icon={person} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}

export default function AppShell({ children }: { children?: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        // Omit baseTheme to let Clerk automatically detect system theme
        variables: {
          // Primary colors
          // Background colors
          colorBackground: 'var(--background)',
          colorInputBackground: 'var(--card)',
          colorText: 'var(--text)',
          colorInputText: 'var(--text)',
          colorInputForeground: 'var(--secondary)',
          colorNeutral: 'var(--text)',
          colorPrimary: 'var(--primary)',
          
        },
        elements: {
          rootBox: 'clerk-root',
          cardBox: 'clerk-card-box',
          card: 'clerk-card',
          main: 'clerk-main',
          formButtonPrimary: 'clerk-button-primary',
          formButtonSecondary: 'clerk-button-secondary',
          socialButtons: 'clerk-social-buttons',
          socialButtonsIcon: 'clerk-social-buttons-icon',
          formFieldInput: 'clerk-input',
          formFieldLabel: 'clerk-label',
          headerTitle: 'clerk-header-title',
          headerSubtitle: 'clerk-header-subtitle',
          lastAuthenticationStrategyBadge: 'clerk-last-authentication-strategy-badge',
        },
      }}
    >
      <ConvexClientProvider>
        <AppContent />
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
