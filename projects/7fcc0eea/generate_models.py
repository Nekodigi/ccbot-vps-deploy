#!/usr/bin/env python3
"""
3Dモデル生成スクリプト
GLB形式のシンプルな3Dモデルを生成
"""

import struct
import json
import base64
import math

def create_box_vertices():
    """キューブの頂点データを生成"""
    vertices = [
        # Front face
        -0.5, -0.5,  0.5,
         0.5, -0.5,  0.5,
         0.5,  0.5,  0.5,
        -0.5,  0.5,  0.5,
        # Back face
        -0.5, -0.5, -0.5,
        -0.5,  0.5, -0.5,
         0.5,  0.5, -0.5,
         0.5, -0.5, -0.5,
        # Top face
        -0.5,  0.5, -0.5,
        -0.5,  0.5,  0.5,
         0.5,  0.5,  0.5,
         0.5,  0.5, -0.5,
        # Bottom face
        -0.5, -0.5, -0.5,
         0.5, -0.5, -0.5,
         0.5, -0.5,  0.5,
        -0.5, -0.5,  0.5,
        # Right face
         0.5, -0.5, -0.5,
         0.5,  0.5, -0.5,
         0.5,  0.5,  0.5,
         0.5, -0.5,  0.5,
        # Left face
        -0.5, -0.5, -0.5,
        -0.5, -0.5,  0.5,
        -0.5,  0.5,  0.5,
        -0.5,  0.5, -0.5,
    ]
    return vertices

def create_box_normals():
    """キューブの法線データを生成"""
    normals = []
    faces = [
        (0, 0, 1),   # Front
        (0, 0, -1),  # Back
        (0, 1, 0),   # Top
        (0, -1, 0),  # Bottom
        (1, 0, 0),   # Right
        (-1, 0, 0),  # Left
    ]
    for normal in faces:
        for _ in range(4):
            normals.extend(normal)
    return normals

def create_box_indices():
    """キューブのインデックスデータを生成"""
    indices = []
    for i in range(6):
        offset = i * 4
        indices.extend([
            offset, offset + 1, offset + 2,
            offset, offset + 2, offset + 3
        ])
    return indices

def create_sphere_vertices(segments=16, rings=16):
    """スフィアの頂点データを生成"""
    vertices = []
    normals = []

    for ring in range(rings + 1):
        theta = ring * math.pi / rings
        sin_theta = math.sin(theta)
        cos_theta = math.cos(theta)

        for seg in range(segments + 1):
            phi = seg * 2 * math.pi / segments
            sin_phi = math.sin(phi)
            cos_phi = math.cos(phi)

            x = cos_phi * sin_theta
            y = cos_theta
            z = sin_phi * sin_theta

            vertices.extend([x * 0.5, y * 0.5, z * 0.5])
            normals.extend([x, y, z])

    return vertices, normals

def create_sphere_indices(segments=16, rings=16):
    """スフィアのインデックスデータを生成"""
    indices = []

    for ring in range(rings):
        for seg in range(segments):
            first = ring * (segments + 1) + seg
            second = first + segments + 1

            indices.extend([first, second, first + 1])
            indices.extend([second, second + 1, first + 1])

    return indices

def create_cylinder_vertices(segments=16):
    """シリンダーの頂点データを生成"""
    vertices = []
    normals = []

    # Top circle
    for i in range(segments):
        angle = i * 2 * math.pi / segments
        x = math.cos(angle) * 0.5
        z = math.sin(angle) * 0.5
        vertices.extend([x, 0.5, z])
        normals.extend([x / 0.5, 0, z / 0.5])

    # Bottom circle
    for i in range(segments):
        angle = i * 2 * math.pi / segments
        x = math.cos(angle) * 0.5
        z = math.sin(angle) * 0.5
        vertices.extend([x, -0.5, z])
        normals.extend([x / 0.5, 0, z / 0.5])

    # Top cap center
    vertices.extend([0, 0.5, 0])
    normals.extend([0, 1, 0])

    # Bottom cap center
    vertices.extend([0, -0.5, 0])
    normals.extend([0, -1, 0])

    return vertices, normals

def create_cylinder_indices(segments=16):
    """シリンダーのインデックスデータを生成"""
    indices = []

    # Side faces
    for i in range(segments):
        next_i = (i + 1) % segments
        indices.extend([i, next_i, i + segments])
        indices.extend([next_i, next_i + segments, i + segments])

    top_center = segments * 2
    bottom_center = segments * 2 + 1

    # Top cap
    for i in range(segments):
        next_i = (i + 1) % segments
        indices.extend([top_center, next_i, i])

    # Bottom cap
    for i in range(segments):
        next_i = (i + 1) % segments
        indices.extend([bottom_center, i + segments, next_i + segments])

    return indices

def create_glb(vertices, normals, indices, output_file):
    """GLBファイルを生成"""

    # バイナリデータに変換
    vertex_data = struct.pack(f'{len(vertices)}f', *vertices)
    normal_data = struct.pack(f'{len(normals)}f', *normals)
    index_data = struct.pack(f'{len(indices)}H', *indices)

    # バッファを結合
    buffer_data = vertex_data + normal_data + index_data
    buffer_length = len(buffer_data)

    # GLTFのJSONデータ
    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "Python GLB Generator"
        },
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0}],
        "meshes": [{
            "primitives": [{
                "attributes": {
                    "POSITION": 0,
                    "NORMAL": 1
                },
                "indices": 2,
                "material": 0
            }]
        }],
        "materials": [{
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.2, 0.5, 0.9, 1.0],
                "metallicFactor": 0.5,
                "roughnessFactor": 0.5
            }
        }],
        "buffers": [{"byteLength": buffer_length}],
        "bufferViews": [
            {
                "buffer": 0,
                "byteOffset": 0,
                "byteLength": len(vertex_data),
                "target": 34962
            },
            {
                "buffer": 0,
                "byteOffset": len(vertex_data),
                "byteLength": len(normal_data),
                "target": 34962
            },
            {
                "buffer": 0,
                "byteOffset": len(vertex_data) + len(normal_data),
                "byteLength": len(index_data),
                "target": 34963
            }
        ],
        "accessors": [
            {
                "bufferView": 0,
                "byteOffset": 0,
                "componentType": 5126,
                "count": len(vertices) // 3,
                "type": "VEC3",
                "max": [max(vertices[i::3]) for i in range(3)],
                "min": [min(vertices[i::3]) for i in range(3)]
            },
            {
                "bufferView": 1,
                "byteOffset": 0,
                "componentType": 5126,
                "count": len(normals) // 3,
                "type": "VEC3"
            },
            {
                "bufferView": 2,
                "byteOffset": 0,
                "componentType": 5123,
                "count": len(indices),
                "type": "SCALAR"
            }
        ]
    }

    # JSONを文字列に変換
    json_string = json.dumps(gltf, separators=(',', ':'))
    json_bytes = json_string.encode('utf-8')

    # パディング
    json_padding = (4 - len(json_bytes) % 4) % 4
    json_bytes += b' ' * json_padding

    buffer_padding = (4 - len(buffer_data) % 4) % 4
    buffer_data += b'\x00' * buffer_padding

    # GLBヘッダー
    magic = 0x46546C67  # 'glTF'
    version = 2
    length = 12 + 8 + len(json_bytes) + 8 + len(buffer_data)

    # GLBファイルを書き込み
    with open(output_file, 'wb') as f:
        # ヘッダー
        f.write(struct.pack('<III', magic, version, length))

        # JSONチャンク
        f.write(struct.pack('<I', len(json_bytes)))
        f.write(struct.pack('<I', 0x4E4F534A))  # 'JSON'
        f.write(json_bytes)

        # バイナリチャンク
        f.write(struct.pack('<I', len(buffer_data)))
        f.write(struct.pack('<I', 0x004E4942))  # 'BIN\0'
        f.write(buffer_data)

    print(f"Generated: {output_file}")

def main():
    """メイン処理"""

    # Box
    box_vertices = create_box_vertices()
    box_normals = create_box_normals()
    box_indices = create_box_indices()
    create_glb(box_vertices, box_normals, box_indices, 'models/box.glb')

    # Sphere
    sphere_vertices, sphere_normals = create_sphere_vertices()
    sphere_indices = create_sphere_indices()
    create_glb(sphere_vertices, sphere_normals, sphere_indices, 'models/sphere.glb')

    # Cylinder
    cylinder_vertices, cylinder_normals = create_cylinder_vertices()
    cylinder_indices = create_cylinder_indices()
    create_glb(cylinder_vertices, cylinder_normals, cylinder_indices, 'models/cylinder.glb')

    print("\nAll 3D models generated successfully!")

if __name__ == '__main__':
    main()
