import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff, LucideIcon } from "lucide-react-native";

interface FormInputProps {
  label: string;
  type: "text" | "email" | "password";
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder: string;
  required?: boolean;
  icon: LucideIcon;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === "password";
  const secureTextEntry = isPassword && !showPassword;

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      <View className={`flex-row items-center border rounded-lg bg-white ${isFocused ? 'border-orange-500 border-2' : 'border-gray-200'}`}>
        <View className="pl-3 pr-2">
          <Icon 
            size={18} 
            color="#9CA3AF"
          />
        </View>
        <TextInput
          className="flex-1 py-3 pr-3 text-sm text-gray-900"
          value={value}
          onChangeText={(text) => onChange(name, text)}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          keyboardType={type === "email" ? "email-address" : "default"}
          autoCapitalize={type === "email" ? "none" : "sentences"}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="px-3"
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff size={18} color="#9CA3AF" />
            ) : (
              <Eye size={18} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormInput;
