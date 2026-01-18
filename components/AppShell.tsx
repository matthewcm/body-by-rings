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
import { IonApp, IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react';
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
            <IonPage>
              <SignIn />
            </IonPage>
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
                <Dashboard />
              </IonPage>
            </Route>
            
            <Route exact path="/diary">
              <IonPage>
                <DiaryScreen />
              </IonPage>
            </Route>
            
            <Route exact path="/plan">
              <IonPage>
                <PlanScreen />
              </IonPage>
            </Route>
            
            <Route exact path="/stats">
              <IonPage>
                <StatsScreen />
              </IonPage>
            </Route>
            
            <Route exact path="/profile">
              <IonPage>
                <ProfileScreen />
              </IonPage>
            </Route>
            
            <Route exact path="/workout/:phase/:day">
              <IonPage>
                <WorkoutScreen />
              </IonPage>
            </Route>
            
            <Route exact path="/custom-workout">
              <IonPage>
                <CustomWorkoutScreen />
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
    <ClerkProvider>
      <ConvexClientProvider>
        <AppContent />
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
