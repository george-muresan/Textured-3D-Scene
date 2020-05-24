#version 300 es
precision highp float;
in vec4 outColor;
out vec4 fragColor;
//in vec4 passToFragColor;
in vec2 texCoordPassThrough;

uniform sampler2D textureImg;
void main(void){
fragColor = texture(textureImg, texCoordPassThrough);
}