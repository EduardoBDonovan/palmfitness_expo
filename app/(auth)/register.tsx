import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter, Link } from 'expo-router';
import { UserPlus, User, Ruler } from 'lucide-react-native';

export default function RegisterScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [profileType, setProfileType] = useState<'Athlete' | 'Coach'>('Athlete');
  
  const [bio, setBio] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleNext = () => {
    if (currentStep === 1) {
      if (!email || !password || password !== confirmPassword) {
        Alert.alert('Error', 'Please fill all fields and ensure passwords match');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!name || !username) {
        Alert.alert('Error', 'Please enter your name and username');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSignUp = async () => {
    setIsSubmitting(true);
    const { error } = await signUp(email, password, {
      name,
      handle: username.startsWith('@') ? username : `@${username}`,
      profile_type: profileType,
      bio,
    });
    
    if (error) {
      Alert.alert('Sign Up Failed', error.message);
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3].map(step => (
        <View 
          key={step} 
          style={[
            styles.stepIndicator, 
            { backgroundColor: step <= currentStep ? '#007AFF' : '#333' }
          ]} 
        />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderStepIndicator()}

        <View style={styles.header}>
          {currentStep === 1 && <UserPlus size={50} color="#007AFF" />}
          {currentStep === 2 && <User size={50} color="#007AFF" />}
          {currentStep === 3 && <Ruler size={50} color="#007AFF" />}
          
          <Text style={styles.title}>
            {currentStep === 1 ? 'Credentials' : currentStep === 2 ? 'Profile' : 'About You'}
          </Text>
          <Text style={styles.subtitle}>
            {currentStep === 1 ? 'Create your account' : currentStep === 2 ? 'Tell us who you are' : 'Complete your profile'}
          </Text>
        </View>

        <View style={styles.form}>
          {currentStep === 1 && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8E8E93"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#8E8E93"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#8E8E93"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </>
          )}

          {currentStep === 2 && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#8E8E93"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#8E8E93"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <View style={styles.typeSelector}>
                <TouchableOpacity 
                  style={[styles.typeButton, profileType === 'Athlete' && styles.typeButtonSelected]}
                  onPress={() => setProfileType('Athlete')}
                >
                  <Text style={[styles.typeButtonText, profileType === 'Athlete' && styles.typeButtonTextSelected]}>Athlete</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeButton, profileType === 'Coach' && styles.typeButtonSelected]}
                  onPress={() => setProfileType('Coach')}
                >
                  <Text style={[styles.typeButtonText, profileType === 'Coach' && styles.typeButtonTextSelected]}>Coach</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {currentStep === 3 && (
            <>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Bio (Optional)"
                placeholderTextColor="#8E8E93"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
              />
            </>
          )}

          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBack}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, { flex: 1 }]} 
              onPress={currentStep === 3 ? handleSignUp : handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {currentStep === 3 ? 'Complete' : 'Next'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 32,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  stepIndicator: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    color: '#8E8E93',
    fontWeight: '600',
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  backButton: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#8E8E93',
    fontSize: 15,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
