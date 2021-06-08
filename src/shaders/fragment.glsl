varying vec2 vCoordinates;
varying vec3 vPos;

uniform sampler2D t1;
uniform sampler2D t2;
uniform sampler2D mask;
uniform float move;

void main(){
    vec2 myUV = vec2(vCoordinates.x/512.,vCoordinates.y/512.);
    vec4 maskTexture = texture2D(mask,gl_PointCoord);
    vec4 texture1  = texture2D(t1,myUV);
    vec4 texture2  = texture2D(t2,myUV);

    vec4 final = mix(texture1,texture2,smoothstep(0.,1.,fract(move)));

    float alpha = 1. - clamp(0.,1.,abs(vPos.z/900.));

    gl_FragColor = final;
    gl_FragColor.a *= maskTexture.r*alpha;
}