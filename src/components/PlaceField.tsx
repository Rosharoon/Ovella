import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { MapPressEvent, Marker, Region } from 'react-native-maps';
import { colors, fonts, radii, shadows } from '../theme';

type Access = 'unknown' | 'granted' | 'denied';

type MapMatch = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

type PlaceValue = {
  place: string;
  latitude?: number;
  longitude?: number;
};

function regionFor(latitude: number, longitude: number): Region {
  return { latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
}

function formatAddress(address: Location.LocationGeocodedAddress) {
  const parts = [address.name, address.street, address.city, address.region, address.postalCode].filter(
    (part): part is string => Boolean(part?.trim()),
  );
  return parts.filter((part, index) => parts.findIndex((item) => item.toLowerCase() === part.toLowerCase()) === index).join(', ');
}

async function lookup(query: string) {
  const points = await Location.geocodeAsync(query);
  const unique = points
    .filter(
      (point, index, list) =>
        list.findIndex(
          (item) => Math.abs(item.latitude - point.latitude) < 0.0001 && Math.abs(item.longitude - point.longitude) < 0.0001,
        ) === index,
    )
    .slice(0, 4);
  const matches: MapMatch[] = [];
  for (const point of unique) {
    let label = query;
    try {
      const [address] = await Location.reverseGeocodeAsync(point);
      if (address) label = formatAddress(address) || query;
    } catch {
      label = query;
    }
    matches.push({
      id: `${point.latitude.toFixed(5)},${point.longitude.toFixed(5)}`,
      label,
      latitude: point.latitude,
      longitude: point.longitude,
    });
  }
  return matches;
}

export function PlaceField({
  place,
  latitude,
  longitude,
  onChange,
}: PlaceValue & { onChange: (next: PlaceValue) => void }) {
  const [access, setAccess] = useState<Access>('unknown');
  const [matches, setMatches] = useState<MapMatch[]>([]);
  const [note, setNote] = useState('');
  const [searching, setSearching] = useState(false);
  const [camera, setCamera] = useState<Region | null>(null);
  const accessRef = useRef<Access>('unknown');
  const queryRef = useRef(place);
  const pinRef = useRef({ latitude, longitude });
  const requestId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<MapView>(null);

  queryRef.current = place;
  pinRef.current = { latitude, longitude };

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then((current) => {
      if (current.status === 'granted') {
        accessRef.current = 'granted';
        setAccess('granted');
      } else if (current.status === 'denied' && current.canAskAgain === false) {
        accessRef.current = 'denied';
        setAccess('denied');
      }
    });
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (access !== 'granted' || camera) return;
    let cancelled = false;
    const pin = pinRef.current;
    if (pin.latitude != null && pin.longitude != null) {
      setCamera(regionFor(pin.latitude, pin.longitude));
      return;
    }
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then((position) => {
        if (!cancelled) setCamera(regionFor(position.coords.latitude, position.coords.longitude));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [access, camera]);

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    mapRef.current?.animateToRegion(regionFor(latitude, longitude), 350);
  }, [latitude, longitude]);

  const ensureAccess = async () => {
    if (accessRef.current === 'granted' || accessRef.current === 'denied') return accessRef.current;
    const current = await Location.getForegroundPermissionsAsync();
    if (current.status === 'granted') {
      accessRef.current = 'granted';
      setAccess('granted');
      return 'granted' as const;
    }
    if (current.status === 'denied' && current.canAskAgain === false) {
      accessRef.current = 'denied';
      setAccess('denied');
      return 'denied' as const;
    }
    const next = await Location.requestForegroundPermissionsAsync();
    const status: Access = next.status === 'granted' ? 'granted' : 'denied';
    accessRef.current = status;
    setAccess(status);
    return status;
  };

  const search = async (query: string) => {
    const id = ++requestId.current;
    setSearching(true);
    setNote('');
    const allowed = await ensureAccess();
    if (id !== requestId.current) return;
    if (allowed !== 'granted') {
      setSearching(false);
      setMatches([]);
      return;
    }
    try {
      const found = await lookup(query);
      if (id !== requestId.current || queryRef.current.trim() !== query) return;
      setMatches(found);
      if (found[0]) {
        onChange({ place: queryRef.current, latitude: found[0].latitude, longitude: found[0].longitude });
        setCamera((current) => current ?? regionFor(found[0].latitude, found[0].longitude));
      } else {
        onChange({ place: queryRef.current });
        setNote('No map match. This place stays as text.');
      }
    } catch {
      if (id !== requestId.current) return;
      setMatches([]);
      onChange({ place: queryRef.current });
      setNote('Could not reach the map. This place stays as text.');
    } finally {
      if (id === requestId.current) setSearching(false);
    }
  };

  useEffect(() => {
    if (access !== 'granted') return;
    if (pinRef.current.latitude != null && pinRef.current.longitude != null) return;
    const query = queryRef.current.trim();
    if (query.length >= 3) void search(query);
  }, [access]);

  const onType = (text: string) => {
    onChange({ place: text });
    setMatches([]);
    if (timer.current) clearTimeout(timer.current);
    const query = text.trim();
    if (query.length < 3) {
      setSearching(false);
      setNote('');
      return;
    }
    timer.current = setTimeout(() => {
      void search(query);
    }, 450);
  };

  const choose = async (latitude: number, longitude: number, label?: string) => {
    let placeLabel = label;
    if (!placeLabel) {
      try {
        const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
        placeLabel = address ? formatAddress(address) : place;
      } catch {
        placeLabel = place;
      }
    }
    onChange({ place: placeLabel || place || 'Dropped pin', latitude, longitude });
    setMatches([]);
    setNote('');
    setCamera((current) => current ?? regionFor(latitude, longitude));
  };

  const useHere = async () => {
    const allowed = await ensureAccess();
    if (allowed !== 'granted') return;
    try {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await choose(position.coords.latitude, position.coords.longitude);
    } catch {
      setNote('Current location is unavailable. Type the place instead.');
    }
  };

  const onMapPress = (event: MapPressEvent) => {
    const { latitude: nextLatitude, longitude: nextLongitude } = event.nativeEvent.coordinate;
    void choose(nextLatitude, nextLongitude);
  };

  const pinned = matches.find(
    (match) => latitude != null && longitude != null && match.latitude === latitude && match.longitude === longitude,
  );

  return (
    <View style={styles.field}>
      <Text style={styles.label}>Place</Text>
      <TextInput
        value={place}
        onChangeText={onType}
        placeholder="Clinic or hospital"
        placeholderTextColor={colors.muted}
        autoCapitalize="words"
        style={styles.input}
      />
      {access === 'unknown' && (place.trim().length > 0 || latitude != null) ? (
        <Pressable onPress={() => void ensureAccess()} style={styles.link} accessibilityRole="button">
          <Text style={styles.linkText}>Show on map</Text>
        </Pressable>
      ) : null}
      {access === 'denied' ? (
        <Text style={styles.note}>Location access is off, so this place is saved as text.</Text>
      ) : null}
      {searching ? (
        <View style={styles.searching}>
          <ActivityIndicator size="small" color={colors.rose} />
          <Text style={styles.note}>Looking on the map…</Text>
        </View>
      ) : null}
      {access === 'granted' && matches.length ? (
        <View style={styles.matches}>
          {matches.map((match) => {
            const selected = pinned?.id === match.id;
            return (
              <Pressable
                key={match.id}
                onPress={() => void choose(match.latitude, match.longitude, match.label)}
                style={[styles.match, selected && styles.matchOn]}
                accessibilityRole="button"
              >
                <Text style={styles.matchText}>{match.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {note ? <Text style={styles.note}>{note}</Text> : null}
      {access === 'granted' && camera ? (
        <View style={styles.mapWrap}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={latitude != null && longitude != null ? regionFor(latitude, longitude) : camera}
            onPress={onMapPress}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {latitude != null && longitude != null ? (
              <Marker
                coordinate={{ latitude, longitude }}
                pinColor={colors.rose}
                draggable
                onDragEnd={(event) => {
                  const next = event.nativeEvent.coordinate;
                  void choose(next.latitude, next.longitude);
                }}
              />
            ) : null}
          </MapView>
          <Pressable onPress={() => void useHere()} style={styles.here} accessibilityRole="button">
            <Text style={styles.hereText}>Use my location</Text>
          </Pressable>
        </View>
      ) : null}
      {access === 'granted' && camera ? (
        <Text style={styles.note}>The pin follows what you type. Tap or drag it to adjust.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontFamily: fonts.bodySemi, color: colors.inkSoft, fontSize: 13 },
  input: {
    backgroundColor: colors.blush,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontFamily: fonts.body,
    color: colors.ink,
    fontSize: 16,
  },
  link: { alignSelf: 'flex-start' },
  linkText: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 13 },
  note: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 12, lineHeight: 17 },
  searching: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  matches: { gap: 6 },
  match: {
    backgroundColor: colors.field,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  matchOn: { borderColor: colors.rose, backgroundColor: colors.petal },
  matchText: { fontFamily: fonts.body, color: colors.ink, fontSize: 13, lineHeight: 18 },
  mapWrap: { borderRadius: 18, overflow: 'hidden', height: 200, ...shadows.soft },
  map: { flex: 1 },
  here: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...shadows.soft,
  },
  hereText: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 12 },
});
