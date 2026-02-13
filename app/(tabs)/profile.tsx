import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../firebaseConfig';

export default function ProfileScreen() {
    const router = useRouter();
    const user = auth.currentUser;

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // Auth guard in _layout will handle redirect
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.webContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.emailText}>{user?.email}</Text>
                            <Text style={styles.uidText}>ID: {user?.uid.slice(0, 8)}...</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account</Text>

                        <TouchableOpacity style={styles.menuItem}>
                            <IconSymbol name="gear" size={20} color="#fff" />
                            <Text style={styles.menuText}>Settings</Text>
                            <IconSymbol name="chevron.right" size={16} color="#666" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <IconSymbol name="bell" size={20} color="#fff" />
                            <Text style={styles.menuText}>Notifications</Text>
                            <IconSymbol name="chevron.right" size={16} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    webContainer: {
        width: '100%',
        maxWidth: 800,
        alignSelf: 'center',
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
    },
    content: {
        padding: 20,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        padding: 20,
        borderRadius: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#333',
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    userInfo: {
        flex: 1,
    },
    emailText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    uidText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Courier',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 16,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A', // or transparent
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
        marginLeft: 12,
    },
    signOutButton: {
        backgroundColor: '#FF3B30',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    signOutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
