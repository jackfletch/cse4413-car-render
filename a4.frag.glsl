// A4 MINI fragment shader
// a majority of this code follows the cube example given in the notes

precision mediump float;

uniform bool outline;
uniform bool useFlat;
uniform bool useAmbient;
uniform bool useDiffuse;
uniform bool useSpecular;
uniform bool useTexture;

uniform sampler2D miniTexture;

varying vec3 fragColor;
varying vec3 eyeNormal;
varying vec3 eyeView;
varying vec2 fragTexturePosition;

// Constants
// Light parameters
const vec3 eyeLight = normalize(vec3(3, 1, 1));

void main() {
    vec3 color, specColor, tmpColor;
    if (useTexture)
        color = texture2D(miniTexture, fragTexturePosition).xyz;
    else
        color = vec3(fragColor);

    // color = fragColor, 1;
    specColor = vec3(1, 1, 1);

    // per fragment Phong lighting
    float diffuse = max(dot(eyeLight, eyeNormal), 0.0);
    float specular = 0.0;
    if (diffuse > 0.0) {
        vec3 eyeReflect = reflect(-eyeLight, eyeNormal);
        specular = max(dot(eyeReflect, eyeView), 0.0);
        specular = pow(specular, 16.0);
    }

    // toggle lighting
    if (!useFlat) {
        tmpColor = vec3(0, 0, 0);
        if(useAmbient)
            tmpColor += .15 * color;
        if(useDiffuse)
            tmpColor += diffuse * color;
        if(useSpecular)
            tmpColor += specColor * specular;
        gl_FragColor = vec4(clamp(tmpColor, 0.0, 1.0), 1.0);
    }
    else {
        gl_FragColor = vec4(color, 1.0);
    }
}
