/**
 * Legacy JSON Loader for Three.js r70 format
 *
 * Parses the old JSONLoader format (metadata.version: 3) and creates BufferGeometry
 * Compatible with Three.js r182+
 */

import * as THREE from 'three'

class LegacyJSONLoader {
  constructor(manager) {
    this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager
  }

  load(url, onLoad, onProgress, onError) {
    const loader = new THREE.FileLoader(this.manager)
    loader.setResponseType('json')
    loader.load(
      url,
      (json) => {
        try {
          const result = this.parse(json)
          onLoad(result.geometry, result.materials)
        } catch (e) {
          if (onError) {
            onError(e)
          } else {
            console.error(e)
          }
        }
      },
      onProgress,
      onError
    )
  }

  parse(json) {
    const geometry = new THREE.BufferGeometry()

    // Parse vertices
    const vertices = json.vertices || []
    const normals = json.normals || []
    const uvs = json.uvs && json.uvs[0] ? json.uvs[0] : []
    const faces = json.faces || []

    // Temporary arrays for building BufferGeometry
    const positionArray = []
    const normalArray = []
    const uvArray = []

    // Parse faces
    // Face format bit flags:
    // 0: isQuad
    // 1: hasMaterial
    // 2: hasFaceUv (deprecated)
    // 3: hasFaceVertexUv
    // 4: hasFaceNormal
    // 5: hasFaceVertexNormal
    // 6: hasFaceColor
    // 7: hasFaceVertexColor

    let offset = 0
    while (offset < faces.length) {
      const type = faces[offset++]

      const isQuad = (type & 1) !== 0
      const hasMaterial = (type & 2) !== 0
      const hasFaceUv = (type & 4) !== 0
      const hasFaceVertexUv = (type & 8) !== 0
      const hasFaceNormal = (type & 16) !== 0
      const hasFaceVertexNormal = (type & 32) !== 0
      const hasFaceColor = (type & 64) !== 0
      const hasFaceVertexColor = (type & 128) !== 0

      // Read vertex indices
      const vertexCount = isQuad ? 4 : 3
      const vertexIndices = []
      for (let i = 0; i < vertexCount; i++) {
        vertexIndices.push(faces[offset++])
      }

      // Skip material index if present
      if (hasMaterial) {
        offset++
      }

      // Skip face UV if present (deprecated)
      if (hasFaceUv) {
        offset++
      }

      // Read vertex UVs
      const vertexUvs = []
      if (hasFaceVertexUv) {
        for (let i = 0; i < vertexCount; i++) {
          vertexUvs.push(faces[offset++])
        }
      }

      // Skip face normal if present
      if (hasFaceNormal) {
        offset++
      }

      // Read vertex normals
      const vertexNormals = []
      if (hasFaceVertexNormal) {
        for (let i = 0; i < vertexCount; i++) {
          vertexNormals.push(faces[offset++])
        }
      }

      // Skip face color if present
      if (hasFaceColor) {
        offset++
      }

      // Skip vertex colors if present
      if (hasFaceVertexColor) {
        for (let i = 0; i < vertexCount; i++) {
          offset++
        }
      }

      // Build triangles
      const triangleIndices = isQuad
        ? [[0, 1, 2], [0, 2, 3]]
        : [[0, 1, 2]]

      for (const tri of triangleIndices) {
        for (const idx of tri) {
          const vertexIndex = vertexIndices[idx]

          // Position
          positionArray.push(
            vertices[vertexIndex * 3],
            vertices[vertexIndex * 3 + 1],
            vertices[vertexIndex * 3 + 2]
          )

          // Normal
          if (hasFaceVertexNormal && vertexNormals[idx] !== undefined) {
            const normalIndex = vertexNormals[idx]
            normalArray.push(
              normals[normalIndex * 3],
              normals[normalIndex * 3 + 1],
              normals[normalIndex * 3 + 2]
            )
          }

          // UV
          if (hasFaceVertexUv && vertexUvs[idx] !== undefined) {
            const uvIndex = vertexUvs[idx]
            uvArray.push(
              uvs[uvIndex * 2],
              uvs[uvIndex * 2 + 1]
            )
          }
        }
      }
    }

    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3))

    if (normalArray.length > 0) {
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normalArray, 3))
    } else {
      geometry.computeVertexNormals()
    }

    if (uvArray.length > 0) {
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvArray, 2))
    }

    // Parse materials (if any)
    const materials = []
    if (json.materials) {
      for (const mat of json.materials) {
        materials.push(this.parseMaterial(mat))
      }
    }

    return { geometry, materials }
  }

  parseMaterial(json) {
    const material = new THREE.MeshPhongMaterial()

    if (json.name !== undefined) material.name = json.name
    if (json.colorDiffuse !== undefined) {
      material.color.setRGB(json.colorDiffuse[0], json.colorDiffuse[1], json.colorDiffuse[2])
    }
    if (json.colorSpecular !== undefined) {
      material.specular.setRGB(json.colorSpecular[0], json.colorSpecular[1], json.colorSpecular[2])
    }
    if (json.colorAmbient !== undefined) {
      // Ambient is no longer supported in the same way, skip
    }
    if (json.colorEmissive !== undefined) {
      material.emissive.setRGB(json.colorEmissive[0], json.colorEmissive[1], json.colorEmissive[2])
    }
    if (json.specularCoef !== undefined) {
      material.shininess = json.specularCoef
    }
    if (json.transparency !== undefined) {
      material.opacity = json.transparency
      if (json.transparency < 1) {
        material.transparent = true
      }
    }

    return material
  }
}

export { LegacyJSONLoader }
