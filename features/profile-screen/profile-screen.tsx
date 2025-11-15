import { THEME } from '@/shared/theme/colours';
import { useUser, useClerk } from '@clerk/clerk-expo';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import { ProfileRow } from './components/profile-row';


export default function ProfileScreen() {
    const { isLoaded, isSignedIn, user } = useUser();
    const { signOut } = useClerk();
    const [isUpdating, setIsUpdating] = useState(false);
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');

    if (!isLoaded || !isSignedIn) {
        return <View style={styles.safeArea}><ActivityIndicator color={THEME.primary} size="large" /></View>;
    }

    const handleNameUpdate = async () => {
        if (!firstName || !lastName) {
            Alert.alert("Error", "First and last name cannot be empty.");
            return;
        }
        setIsUpdating(true);
        try {
            await user.update({ firstName, lastName });
            Alert.alert("Success", "Your name has been updated.");
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to update your name.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action is irreversible.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await user.delete();
                        // The user will be signed out automatically.
                    } catch (err) {
                        console.error(err);
                        Alert.alert("Error", "Failed to delete your account.");
                    }
                }}
            ]
        );
    };


    const appVersion = DeviceInfo.getVersion() || '1.0.0';
    const accountCreated = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Manage Account</Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Update Your Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholderTextColor={THEME.placeholder}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                        placeholderTextColor={THEME.placeholder}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleNameUpdate} disabled={isUpdating}>
                        <Text style={styles.buttonText}>{isUpdating ? "Updating..." : "Save Changes"}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                     <Text style={styles.cardTitle}>Account Information</Text>
                     <ProfileRow icon="envelope" label="Email" value={user.primaryEmailAddress?.toString() || ''} />
                     <ProfileRow icon="calendar-alt" label="Account Created" value={accountCreated} />
                     <ProfileRow icon="info-circle" label="App Version" value={appVersion} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Danger Zone</Text>
                    <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
                        <Text style={styles.dangerButtonText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>

                 <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()}>
                    <Text style={styles.signOutButtonText}>Sign Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: THEME.background },
    container: { padding: 16 },
    header: { fontSize: 32, fontWeight: 'bold', color: THEME.text, marginBottom: 24, textAlign: 'center' },
    card: { backgroundColor: THEME.card, borderRadius: 12, padding: 16, marginBottom: 16 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text, marginBottom: 16 },
    input: { backgroundColor: THEME.background, color: THEME.text, borderRadius: 8, borderWidth: 1, borderColor: THEME.border, padding: 12, fontSize: 16, marginBottom: 12 },
    button: { backgroundColor: THEME.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: THEME.border, paddingBottom: 12 },
    icon: { width: 25 },
    label: { color: THEME.subtleText, fontSize: 16, flex: 1 },
    value: { color: THEME.text, fontSize: 16, fontWeight: '600' },
    dangerButton: { backgroundColor: 'rgba(207, 102, 121, 0.1)', padding: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: THEME.error },
    dangerButtonText: { color: THEME.error, fontWeight: 'bold', fontSize: 16 },
    signOutButton: { marginTop: 24, padding: 14, backgroundColor: THEME.error,alignItems: 'center' },
    signOutButtonText: { color: THEME.text, fontSize: 16 },
});


