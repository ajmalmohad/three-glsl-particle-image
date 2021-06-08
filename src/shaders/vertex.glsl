varying vec2 vUV;
varying vec2 vCoordinates;
varying vec3 vPos;
attribute vec3 aCoordinates;
attribute float aSpeed;
attribute float aOffset;
attribute float aDirection;
attribute float aPress;

uniform float move;
uniform float time;
uniform vec2 mouse;
uniform float mousePressed;
uniform float transition;

void main(){
    vUV = uv;
    vec3 pos = position;

    //Not Stable
    pos.x += sin(move)*50. ;
    pos.y += sin(move)*50. ;
    pos.z = mod(position.z + move*aSpeed + aOffset,2000.);

    vec3 notstable = pos;
    //Stable
    vec3 stable = position;
    float dist = distance(stable.xy,mouse);
    float area = 1. - smoothstep(0.,400.,dist);

    stable.x += 20.*sin(0.1*time*aPress)*aDirection*area*mousePressed;
    stable.y += 20.*sin(0.1*time*aPress)*aDirection*area*mousePressed;
    stable.z += 200.*cos(0.1*time*aPress)*aDirection*area*mousePressed;

    vec3 final = mix(stable,notstable,transition);

    vec4 mvPosition=modelViewMatrix*vec4(final,1.);
    gl_PointSize=2500.*(1./-mvPosition.z);
    gl_Position= projectionMatrix * mvPosition;

    vCoordinates = aCoordinates.xy;
    vPos = pos;
} 