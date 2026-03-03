import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Image,
} from 'react-native';
import {
    Appbar,
    Card,
    Text,
    Avatar,
    Button,
    IconButton,
    useTheme,
    Divider,
    ActivityIndicator
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/api';

export default function HomeScreen() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const theme = useTheme();

    useEffect(() => {
        const loadUser = async () => {
            const currentUser = await authService.getCurrentUser();
            if (!currentUser) {
                router.replace('/login');
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        router.replace('/login');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Custom Paper Appbar with Gradient background */}
            <LinearGradient
                colors={['#0f172a', '#1e293b']}
                style={styles.gradientHeader}
            >
                <Appbar.Header style={styles.appbar} mode="center-aligned">
                    <View style={styles.headerLogoContainer}>
                        <Image
                            source={require('../../assets/images/logo.png')}
                            style={styles.headerLogo}
                            resizeMode="contain"
                        />
                    </View>
                    <Appbar.Content
                        title="Gestión Sandor"
                        subtitle="Módulo Administrativo"
                        titleStyle={styles.appbarTitle}
                        subtitleStyle={styles.appbarSubtitle}
                    />
                    <Appbar.Action icon="logout" color="#f8fafc" onPress={handleLogout} />
                </Appbar.Header>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* User Profile Card */}
                <Card style={styles.welcomeCard} mode="elevated">
                    <Card.Content style={styles.cardRow}>
                        <Avatar.Icon
                            size={64}
                            icon="account"
                            style={styles.avatar}
                            backgroundColor="#e2e8f0"
                            color="#3b82f6"
                        />
                        <View style={styles.userInfo}>
                            <Text variant="labelLarge" style={styles.welcomeLabel}>Hola,</Text>
                            <Text variant="headlineSmall" style={styles.userName}>
                                {user?.first_name} {user?.last_name}
                            </Text>
                            <View style={styles.roleContainer}>
                                <Text variant="labelSmall" style={styles.roleText}>
                                    {user?.is_superuser ? 'Superusuario' : 'Administrador'}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                <Text variant="titleMedium" style={styles.sectionTitle}>Panel de Control</Text>

                {/* Dashboard Grid using Paper Cards */}
                <View style={styles.grid}>
                    <View style={styles.gridRow}>
                        <Card style={styles.gridCard} mode="contained">
                            <Card.Content style={styles.gridCardContent}>
                                <Avatar.Icon size={48} icon="account-group" backgroundColor="#eff6ff" color="#3b82f6" />
                                <Text variant="titleSmall" style={styles.gridLabel}>Personal</Text>
                            </Card.Content>
                        </Card>
                        <Card style={styles.gridCard} mode="contained">
                            <Card.Content style={styles.gridCardContent}>
                                <Avatar.Icon size={48} icon="file-document-outline" backgroundColor="#ecfdf5" color="#10b981" />
                                <Text variant="titleSmall" style={styles.gridLabel}>Contratos</Text>
                            </Card.Content>
                        </Card>
                    </View>

                    <View style={styles.gridRow}>
                        <Card style={styles.gridCard} mode="contained">
                            <Card.Content style={styles.gridCardContent}>
                                <Avatar.Icon size={48} icon="domain" backgroundColor="#fff7ed" color="#f97316" />
                                <Text variant="titleSmall" style={styles.gridLabel}>Empresas</Text>
                            </Card.Content>
                        </Card>
                        <Card style={styles.gridCard} mode="contained">
                            <Card.Content style={styles.gridCardContent}>
                                <Avatar.Icon size={48} icon="cog-outline" backgroundColor="#faf5ff" color="#a855f7" />
                                <Text variant="titleSmall" style={styles.gridLabel}>Ajustes</Text>
                            </Card.Content>
                        </Card>
                    </View>
                </View>

                {/* Info Card */}
                <Card style={styles.infoCard} mode="flat">
                    <Card.Content style={styles.infoContent}>
                        <IconButton
                            icon="information"
                            size={24}
                            iconColor="#64748b"
                        />
                        <Text variant="bodySmall" style={styles.infoText}>
                            Conexión segura establecida con la API de Producción. Sus acciones están siendo monitoreadas.
                        </Text>
                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    gradientHeader: {
        paddingTop: 0,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    appbar: {
        backgroundColor: 'transparent',
    },
    appbarTitle: {
        color: '#f8fafc',
        fontWeight: 'bold',
        fontSize: 18,
    },
    appbarSubtitle: {
        color: '#94a3b8',
        fontSize: 12,
    },
    headerLogoContainer: {
        marginLeft: 10,
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 8,
    },
    headerLogo: {
        width: 35,
        height: 35,
    },
    scrollContent: {
        padding: 20,
    },
    welcomeCard: {
        borderRadius: 16,
        marginBottom: 25,
        backgroundColor: '#fff',
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    avatar: {
        marginRight: 20,
    },
    userInfo: {
        flex: 1,
    },
    welcomeLabel: {
        color: '#64748b',
    },
    userName: {
        color: '#1e293b',
        fontWeight: 'bold',
        marginVertical: 2,
    },
    roleContainer: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    roleText: {
        color: '#1e40af',
        fontWeight: 'bold',
    },
    sectionTitle: {
        marginBottom: 15,
        color: '#475569',
        fontWeight: 'bold',
    },
    grid: {
        marginBottom: 10,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    gridCard: {
        width: '48%',
        borderRadius: 16,
        backgroundColor: '#fff',
    },
    gridCardContent: {
        alignItems: 'center',
        padding: 15,
    },
    gridLabel: {
        marginTop: 12,
        fontWeight: 'bold',
        color: '#475569',
    },
    infoCard: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        marginTop: 10,
    },
    infoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    infoText: {
        flex: 1,
        color: '#64748b',
    },
});