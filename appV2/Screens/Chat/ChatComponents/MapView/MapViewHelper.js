import GlobalColors from '../../../../config/styles';
import { MarkerIconTypes, UserTrackingMode } from './config';
import _ from 'lodash';

export const generateMapData = (props) => {
    const {
        planeRoutes = [],
        markers = [],
        polylines = [],
        routes = []
    } = props;

    // REGION
    // let region = {};
    // if (region) {
    //     if (
    //         !region.zoom ||
    //         !region.longitude ||
    //         !region.latitude
    //     ) {
    //         region = await this.getRegion();
    //     } else {
    //         region = region;
    //     }
    // } else {
    //     region = await this.getRegion();
    // }
    // this.region = region;

    // GREAT CIRCLE
    const planeRoutesGJ = planeRoutes.map((route) => {
        const start = turf_helpers.point([
            route.start.longitude,
            route.start.latitude
        ]);
        const end = turf_helpers.point([
            route.end.longitude,
            route.end.latitude
        ]);
        return turf.greatCircle(start, end, {
            offset: 100, // used to avoid broken line round anti meridian
            name: route.id,
            color: route.color ? route.color : GlobalColors.frontmLightBlue
        });
    });
    const features = [];
    // MARKERS and POI
    const markersGJ = [];
    const pointsOfInterest = [];
    markers.forEach((marker) => {
        const position = [
            marker.coordinate.longitude,
            marker.coordinate.latitude
        ];
        const markerObject = {
            type: 'Feature',
            properties: {
                iconType: marker.iconType || MarkerIconTypes.BLACK_CIRCLE,
                id: marker.id,
                title: marker.title,
                description: marker.description,
                draggable: marker.draggable,
                rotation: marker.coordinate.direction
            },
            geometry: {
                type: 'Point',
                coordinates: position
            }
        };
        markersGJ.push(markerObject);

        const poi = {
            id: marker.id,
            coordinate: position,
            color: marker.color
        };
        pointsOfInterest.push(poi);
        // }
    });
    features.push(...planeRoutesGJ);
    // POLYLINES
    const polylinesGJ = _.map(polylines, (polyline) => {
        const vertices = _.map(polyline.coordinates, (coords) => {
            const vertex = [coords.longitude, coords.latitude];
            return vertex;
        });
        if (vertices.length > 0) {
            const first = polyline.coordinates[0];
            const last = polyline.coordinates[polyline.coordinates.length - 1];
            if (
                first.longitude !== last.longitude ||
                first.latitude !== last.latitude
            ) {
                vertices.push([first.longitude, first.latitude]);
            }
        }

        const lineString = {
            type: 'Feature',
            properties: {
                id: polyline.id,
                title: polyline.title,
                description: polyline.description,
                color: polyline.color
                    ? polyline.color
                    : GlobalColors.frontmLightBlue
            },
            geometry: {
                type: 'Polygon',
                coordinates: [vertices]
            }
        };
        return lineString;
    });
    features.push(...polylinesGJ);

    // VESSEL ROUTES
    routes.forEach((route) => {
        const vertices = _.map(route.coordinates, (coords) => {
            const vertex = [
                parseFloat(coords.longitude),
                parseFloat(coords.latitude)
            ];
            return vertex;
        });
        const lineString = {
            type: 'Feature',
            properties: {
                id: route.id,
                title: route.id,
                color: route.routeColour
                    ? route.routeColour
                    : GlobalColors.frontmLightBlue
            },
            geometry: {
                type: 'LineString',
                coordinates: vertices
            }
        };
        features.push(lineString);
    });

    // GENERATE GEOJSON
    const GEOJson = {
        type: 'FeatureCollection',
        features: features
    };
    // ROUTE TRACKER
    const trackerData = getRouteTracker(props);
    console.log('mapdata:', GEOJson, trackerData, pointsOfInterest);
    return {
        GEOJson,
        trackerData,
        pointsOfInterest
    };
};

const getRouteTracker = (props) => {
    if (props.conversational) {
        let markerToTrack;
        const routeToTrack = _.find(
            props.mapData.planeRoutes,
            (route) => route.showTracker
        );
        if (routeToTrack) {
            markerToTrack = _.find(
                props.mapData.markers,
                (marker) => routeToTrack.id === marker.id
            );
            if (markerToTrack) {
                const trackerData = {
                    routeId: markerToTrack.id,
                    startId: routeToTrack.start.id,
                    endId: routeToTrack.end.id,
                    // metric system ftw!
                    altitude:
                        (markerToTrack.coordinate.altitude
                            ? JSON.stringify(markerToTrack.coordinate.altitude)
                            : '-') +
                        (markerToTrack.coordinate.imperial ? ' ft' : ' m'),
                    speed:
                        (markerToTrack.coordinate.speed
                            ? JSON.stringify(markerToTrack.coordinate.speed)
                            : '-') +
                        (markerToTrack.coordinate.imperial ? ' mph' : ' km/h'),
                    // startCoord: [
                    //     routeToTrack.start.longitude,
                    //     routeToTrack.start.latitude
                    // ],
                    // endCoord: [
                    //     routeToTrack.end.longitude,
                    //     routeToTrack.end.latitude
                    // ],
                    // currentCoord: [
                    //     markerToTrack.coordinate.longitude,
                    //     markerToTrack.coordinate.latitude
                    // ],
                    startTime: routeToTrack.start.time,
                    currentTime: new Date().getTime(),
                    arrivalTime: routeToTrack.end.time
                };
                return trackerData;
            }
        }
        return null;
    }
    return null;
};

// const getRegion =() =>{
//     return new Promise((resolve, reject) => {
//         const region = {};
//         this.map
//             .getZoom()
//             .then((zoom) => {
//                 region.zoom = zoom;
//                 return this.map.getCenter();
//             })
//             .then((center) => {
//                 region.longitude = center[0];
//                 region.latitude = center[1];
//                 resolve(region);
//             })
//             .catch(() => {
//                 reject(this.defaultRegion);
//             });
//     });
// }
