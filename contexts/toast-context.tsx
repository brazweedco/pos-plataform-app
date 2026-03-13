import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_CONFIG: Record<ToastType, { icon: keyof typeof Feather.glyphMap; bg: string; border: string }> = {
  success: { icon: "check-circle", bg: "#E8F5E9", border: "#4CAF50" },
  error: { icon: "alert-circle", bg: "#FFEBEE", border: "#F44336" },
  warning: { icon: "alert-triangle", bg: "#FFF8E1", border: "#FF9800" },
  info: { icon: "info", bg: "#E3F2FD", border: "#2196F3" },
};

function ToastComponent({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const config = TOAST_CONFIG[toast.type];

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      handleDismiss();
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          top: insets.top + sy(10),
          paddingHorizontal: sx(16),
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Pressable
        style={[
          styles.toast,
          {
            backgroundColor: config.bg,
            borderColor: config.border,
            borderRadius: s(12),
            paddingVertical: sy(14),
            paddingHorizontal: sx(16),
          },
        ]}
        onPress={handleDismiss}
      >
        <Feather name={config.icon} size={s(20)} color={config.border} />
        <Text
          style={[
            styles.message,
            { fontSize: s(FONT_SIZES.sm), marginLeft: sx(12), flex: 1 },
          ]}
          numberOfLines={3}
        >
          {toast.message}
        </Text>
        <Feather name="x" size={s(18)} color={COLORS.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const showError = useCallback((message: string) => {
    showToast(message, "error", 5000);
  }, [showToast]);

  const showSuccess = useCallback((message: string) => {
    showToast(message, "success", 3000);
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast(message, "warning", 4000);
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast(message, "info", 4000);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, showWarning, showInfo }}>
      {children}
      <View style={styles.toastsWrapper} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  toastsWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  toastContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  message: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
});
