import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const ResponsiveImage = ({ source, aspectRatio = 1 }) => {
  return (
    <View style={[styles.container, { width: width }]}>
      <Image
        source={source}
        style={{
          width: '100%',
          height: width * aspectRatio,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});

export default ResponsiveImage;
