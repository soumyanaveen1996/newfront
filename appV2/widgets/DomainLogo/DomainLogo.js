import React from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import configToUse from '../../config/config';
import images from '../../images';
import GlobalColors from '../../config/styles';

export default function DomainLogo({
    selected,
    hasNotification,
    domain,
    size = 40,
    showDefault = false
}) {
    const borderRadius = size / 4;
    const imageStyles = selected
        ? [
              styles.selectedDomainImage,
              !showDefault
                  ? {
                        borderRadius: borderRadius
                    }
                  : undefined
          ]
        : [
              styles.domainImage,
              !showDefault
                  ? {
                        borderRadius: borderRadius
                    }
                  : undefined
          ];
    return (
        <View
            style={{
                width: size,
                height: size,
                backgroundColor: GlobalColors.white,
                borderRadius: borderRadius,
                overflow: 'hidden'
            }}
        >
            <Image
                source={{
                    uri: domain
                        ? `${configToUse.proxy.contentURL}${domain.logoUrl}`
                        : undefined
                }}
                defaultSource={images.hamburger}
                style={imageStyles}
            />
            {hasNotification ? (
                <View
                    style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: 'red',
                        position: 'absolute',
                        top: 5,
                        right: 5
                    }}
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    domainImage: {
        width: '100%',
        height: '100%'
    },
    selectedDomainImage: {
        width: '100%',
        height: '100%',
        borderColor: GlobalColors.primaryButtonColor,
        shadowColor: GlobalColors.primaryButtonColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        ...Platform.select({
            ios: {},
            android: { elevation: 5 }
        })
    }
});
