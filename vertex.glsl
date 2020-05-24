#version 300 es
layout (location=0) in vec3 vertPosition;
layout (location=1) in vec3 vertNormal;
layout (location=2) in vec2 vTextCoord;

uniform mat4 projMatrix;
uniform mat4 modelToWorldMatrix;
uniform mat4 viewMatrix;
uniform mat4 uNormalMatrix;

uniform vec3 uColor;

uniform vec3 uDiffuseLightColor;

uniform vec3 uDiffuseLightDirection;

uniform vec3 uAmbientLightColor;
out vec4 outColor;
out vec2 texCoordPassThrough;   

void main(void){
gl_Position = projMatrix * viewMatrix * modelToWorldMatrix * vec4(vertPosition, 1.0);
vec3 normal = normalize( vec3( (transpose(inverse(modelToWorldMatrix))) * vec4(vertNormal, 0.0) ) );
vec3 LightDir = normalize(uDiffuseLightDirection);
float cosTheta = max( dot(LightDir, normal), 0.0);
vec3 diffuseReflection = uDiffuseLightColor * uColor * cosTheta;
vec3 ambientReflection = uAmbientLightColor * uColor;

outColor = vec4(ambientReflection + diffuseReflection, 1.0);
texCoordPassThrough = vTextCoord;
}