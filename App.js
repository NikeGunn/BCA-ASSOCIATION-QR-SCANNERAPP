import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';

function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState(null);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [scanLineAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (scanned && !animationStarted) {
      animateScanLine();
      setAnimationStarted(true);
    } else if (!scanned && animationStarted) {
      scanLineAnimation.stopAnimation();
      setAnimationStarted(false);
    }
  }, [scanned, animationStarted]);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        setData(null);
      }, 60000);

      return () => clearTimeout(timer);
    }
  }, [data]);

  const animateScanLine = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleBarCodeScanned = async ({ data }) => {
    try {
      const response = await fetch(`https://mmamc-api-college.onrender.com/api/students/${data}`);
      const product = await response.json();
      setData(product);
      setScanned(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
  };

  return (
    <View style={styles.container}>
      {hasPermission === null ? (
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      ) : hasPermission === false ? (
        <Text style={styles.permissionText}>No access to camera</Text>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.overlay}>
            <View style={styles.scanLineContainer}>
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 330],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
            <View style={styles.scanCorner} />
          </View>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleScanAgain}
            activeOpacity={0.3}
            disabled={!scanned}
          >
            <MaterialIcons name="center-focus-strong" size={56} color="#fff" />
          </TouchableOpacity>
          {data && (
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: scanLineAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.5, 1],
                  }),
                },
              ]}
            >
              <Text style={styles.cardHeading}>Students Data: Verified</Text>
              <View style={styles.cardData}>
                <Text style={styles.cardText}>Name: {data?.name}</Text>
                <Text style={styles.cardText}>RollNo: {data?.RollNo}</Text>
                <Text style={styles.cardText}>Batch: {data?.Batch}</Text>
                <Text style={styles.cardText}>CreatedAt: {data?.createdAt}</Text>
                {/* Add more fields as needed */}
              </View>
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 18,
    color: '#fff',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLineContainer: {
    width: '75%',
    height: 2,
    marginBottom: 4,
  },
  scanLine: {
    flex: 1,
    backgroundColor: '#007BFF',
  },
  scanCorner: {
    width: 350,
    height: 350,
    borderWidth: 4,
    borderRadius: 20,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
    backgroundColor: 'rgba(173, 216, 230, 0.5)',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  },
  card: {
    position: 'absolute',
    bottom: 300,
    left: 32,
    right: 32,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 4,
  },
  cardHeading: {
    fontSize: 27,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007BFF',
    textAlign: 'center',
  },
  cardData: {
    marginBottom: 8,
  },
  cardText: {
    fontSize: 18,
    marginBottom: 4,
    color: '#333',
  },
  captureButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#007BFF',
    borderRadius: 100,
    padding: 16,
    elevation: 4,
  },
});

export default App;