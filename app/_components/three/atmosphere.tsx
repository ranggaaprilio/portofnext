"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  #include <fog_pars_vertex>
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

/** Additive glow can't blend towards the fog colour, so it just dims with the scene fog instead. */
const fogFade = /* glsl */ `
  #ifdef USE_FOG
    gl_FragColor.rgb *= 1.0 - smoothstep(fogNear, fogFar, vFogDepth);
  #endif
`;

/** Outer halo: brightest right at the limb, fading out into space. */
const haloShader = /* glsl */ `
  #include <fog_pars_fragment>
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float facing = dot(-vNormal, vView);
    float glow = pow(clamp(facing, 0.0, 1.0), 6.0);
    gl_FragColor = vec4(uColor * glow * uIntensity, 1.0);
    ${fogFade}
  }
`;

/** Thin haze over the disc, stronger towards the edge (Fresnel). */
const hazeShader = /* glsl */ `
  #include <fog_pars_fragment>
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = 1.0 - clamp(dot(vNormal, vView), 0.0, 1.0);
    gl_FragColor = vec4(uColor * pow(rim, 3.0) * uIntensity * 0.8, 1.0);
    ${fogFade}
  }
`;

/**
 * Additive glow shells around a planet: a back-face halo just outside the
 * surface plus a front-face haze. Not physically based, but it reads as an
 * atmosphere and costs two cheap draws.
 */
const Atmosphere = ({
  color,
  radius,
  intensity,
}: {
  color: string;
  radius: number;
  intensity: number;
}) => {
  const { geometry, halo, haze } = useMemo(() => {
    const uniforms = () => ({
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    });
    const common = {
      vertexShader,
      fog: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    };
    return {
      geometry: new THREE.SphereGeometry(1, 64, 32),
      halo: new THREE.ShaderMaterial({
        ...common,
        fragmentShader: haloShader,
        uniforms: uniforms(),
        side: THREE.BackSide,
      }),
      haze: new THREE.ShaderMaterial({
        ...common,
        fragmentShader: hazeShader,
        uniforms: uniforms(),
      }),
    };
  }, [color, intensity]);

  useEffect(
    () => () => {
      geometry.dispose();
      halo.dispose();
      haze.dispose();
    },
    [geometry, halo, haze],
  );

  return (
    <>
      <mesh geometry={geometry} material={halo} scale={radius * 1.04} />
      <mesh geometry={geometry} material={haze} scale={radius * 0.985} />
    </>
  );
};

export default Atmosphere;
