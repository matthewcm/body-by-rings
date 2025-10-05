import React from 'react';
import { View, StyleSheet } from 'react-native';
// In your local project, you should have the line below uncommented.
import { Svg, Path } from 'react-native-svg';
import Body from "react-native-body-highlighter";



export const MuscleMap = () => {

    return (
        <View style={styles.muscleMapContainer}>
            {/* --- FRONT VIEW --- */}
           <Body
        data={[
          { slug: "chest", intensity: 1, side: "left" },
          { slug: "biceps", intensity: 2 },
        ]}
        gender="male"
        side="front"
        scale={0.5}
        border="#dfdfdf"
      />
            
            {/* --- BACK VIEW --- */}
           <Body
        data={[
          { slug: "chest", intensity: 1, side: "left" },
          { slug: "biceps", intensity: 2 },
        ]}
        gender="male"
        side="back"
        scale={0.5}
        border="#dfdfdf"
      />
        </View>
    );
};

const styles = StyleSheet.create({
    muscleMapContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 10,
        paddingHorizontal: 20,
    },
});


