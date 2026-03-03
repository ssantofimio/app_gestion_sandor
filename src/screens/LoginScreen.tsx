import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
    ScrollView,
} from 'react-native';
import {
    TextInput,
    Button,
    Text,
    ActivityIndicator,
    useTheme,
    IconButton
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/api';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const theme = useTheme();

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Datos incompletos', 'Por favor, ingresa tu usuario y contraseña.');
            return;
        }

        setLoading(true);
        try {
            console.log(`[LoginScreen] Iniciando login para ${username}...`);
            const result = await authService.login(username, password);

            if (result.success) {
                router.replace('/(tabs)');
            } else {
                Alert.alert('Acceso Denegado', result.message || 'Credenciales incorrectas');
            }
        } catch (error: any) {
            console.error('[LoginScreen] Error de conexión:', error);
            Alert.alert(
                'Error de Red',
                `No se pudo conectar con el servidor.\n\nURL: http://144.217.12.198:8010`
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#0f172a', '#1e293b', '#334155']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.innerContainer}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Image
                                source={require('../../assets/images/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text variant="headlineLarge" style={styles.brandName}>Gestión Sandor</Text>
                        <Text variant="labelLarge" style={styles.brandTagline}>Soluciones Corporativas</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <TextInput
                            label="Nombre de usuario"
                            mode="outlined"
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                            left={<TextInput.Icon icon="account-outline" color="#94a3b8" />}
                            outlineColor="rgba(148, 163, 184, 0.2)"
                            activeOutlineColor="#3b82f6"
                            textColor="#f8fafc"
                        />

                        <TextInput
                            label="Contraseña"
                            mode="outlined"
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            left={<TextInput.Icon icon="lock-outline" color="#94a3b8" />}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? "eye-off-outline" : "eye-outline"}
                                    color="#94a3b8"
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                            outlineColor="rgba(148, 163, 184, 0.2)"
                            activeOutlineColor="#3b82f6"
                            textColor="#f8fafc"
                        />

                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                            labelStyle={styles.buttonLabel}
                            contentStyle={styles.buttonContent}
                        >
                            Iniciar Sesión
                        </Button>

                        <Button
                            mode="text"
                            onPress={() => { }}
                            textColor="#94a3b8"
                            style={styles.forgotPassword}
                        >
                            ¿Olvidaste tu contraseña?
                        </Button>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Text variant="labelSmall" style={styles.footerText}>© 2026 Gestión Sandor S.A.S</Text>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingTop: 50,
        paddingBottom: 100,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    logo: {
        width: 100,
        height: 100,
    },
    brandName: {
        fontWeight: '900',
        color: '#f8fafc',
        letterSpacing: 0.5,
    },
    brandTagline: {
        color: '#94a3b8',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
    },
    button: {
        marginTop: 10,
        borderRadius: 12,
        backgroundColor: '#3b82f6',
    },
    buttonContent: {
        height: 55,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    forgotPassword: {
        marginTop: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        color: '#64748b',
    },
});