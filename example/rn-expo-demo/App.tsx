import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import * as Icons from '@yoroll/rn-icon'

// 过滤出组件（排除类型导出）
const iconEntries = Object.entries(Icons).filter(
  ([, C]) => typeof C === 'function'
) as [string, React.ComponentType<Icons.IconProps>][]

const COLORS = ['#ffffff', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff']
const SIZES = [16, 24, 32, 40]

export default function App() {
  const [color, setColor] = useState('#ffffff')
  const [size, setSize] = useState(24)

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>@yoroll/rn-icon</Text>
        <Text style={styles.subtitle}>
          {iconEntries.length} icons · React Native Demo
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Color Picker */}
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Color</Text>
          <View style={styles.controlOptions}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  color === c && styles.colorDotActive,
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </View>

        {/* Size Picker */}
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Size</Text>
          <View style={styles.controlOptions}>
            {SIZES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.sizeBtn,
                  size === s && styles.sizeBtnActive,
                ]}
                onPress={() => setSize(s)}
              >
                <Text
                  style={[
                    styles.sizeBtnText,
                    size === s && styles.sizeBtnTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Icon Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.grid}
      >
        {iconEntries.map(([name, IconComponent]) => (
          <View key={name} style={styles.iconItem}>
            <View style={styles.iconWrapper}>
              <IconComponent size={size} color={color} />
            </View>
            <Text style={styles.iconName} numberOfLines={2}>
              {name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  controls: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    width: 40,
  },
  controlOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: 'rgba(255,255,255,0.8)',
  },
  sizeBtn: {
    width: 36,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sizeBtnText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  sizeBtnTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  iconItem: {
    width: '20%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  iconName: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 6,
    textAlign: 'center',
  },
})
