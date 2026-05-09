import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const FormInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  icon,
  editable = true,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {icon && <Icon name={icon} size={20} color="#666" style={styles.icon} />}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        (disabled || loading) && styles.primaryButtonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <Text style={styles.primaryButtonText}>Loading...</Text>
      ) : (
        <Text style={styles.primaryButtonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export const SecondaryButton = ({
  title,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.secondaryButton, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

export const LoadingSpinner = () => {
  return (
    <View style={styles.spinnerContainer}>
      <View style={styles.spinner} />
      <Text style={styles.spinnerText}>Loading...</Text>
    </View>
  );
};

export const ErrorMessage = ({ message, onRetry }) => {
  return (
    <View style={styles.errorContainer}>
      <Icon name="error-outline" size={40} color="#F44336" />
      <Text style={styles.errorMessageText}>{message}</Text>
      {onRetry && (
        <PrimaryButton title="Retry" onPress={onRetry} style={styles.retryButton} />
      )}
    </View>
  );
};

export const Card = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
  },
  inputContainerFocused: {
    borderColor: '#2196F3',
  },
  inputContainerError: {
    borderColor: '#F44336',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: '#BDBDBD',
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#F0F0F0',
    borderTopColor: '#2196F3',
    marginBottom: 10,
  },
  spinnerText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorMessageText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    width: '50%',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
