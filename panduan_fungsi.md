# 🎬 Premiere Pro Scripting API Reference Lengkap (ExtendScript, UXP, QE) 2019-2026
Dokumentasi ini merangkum seluruh properti, atribut, dan metode dari Document Object Model (DOM) Adobe Premiere Pro, termasuk transisi dari lingkungan sinkron ExtendScript ke lingkungan asinkron UXP modern (2025-2026).

## 🕒 1. Core & Time (Ticks)
Semua waktu internal dengan presisi sempurna (in/out, marker, keyframe) wajib menggunakan ticks.
- **Rumus:** `seconds = ticks / 254016000000` | `ticks = seconds * 254016000000`
- **Time Object:** Objek waktu dikembalikan oleh DOM yang dapat diakses via `timeObj.ticks` (string) atau `timeObj.seconds` (float).
- **Konversi Timecode:** Untuk menghitung frame dari ticks: `frame = ticks / seq.timebase`. Timebase tipikal: 23.976fps = `10594584000`, 24fps = `10584000000`, 25fps = `10160640000`, 29.97fps = `8475667200`, 30fps = `8467200000`.

**Contoh konversi:**
```javascript
// Detik ke ticks
var ticks = String(detik * 254016000000);
// Ticks ke detik
var detik = parseFloat(timeObj.ticks) / 254016000000;
// Akses langsung
var detik = parseFloat(timeObj.seconds);
var tickStr = timeObj.ticks; // string
```

## 📦 2. Application (app) & Ekosistem Global
Akar dari skrip, dipanggil dengan `app` di ExtendScript, atau `const app = require('premierepro')` di UXP.

### Properti Global `app`
| Method / Property | Return / Type | Deskripsi |
| --- | --- | --- |
| `app.anywhere` | `Anywhere` | Mengakses server Adobe Anywhere (usang). |
| `app.build` | `string` | Nomor build internal Premiere Pro. |
| `app.encoder` | `Encoder` | Akses langsung ke mesin Adobe Media Encoder. |
| `app.metadata` | `Metadata` | Akses ke objek manipulasi metadata. |
| `app.path` | `string` | Path absolut ke file eksekusi Premiere Pro. |
| `app.production` | `Production` | Mengembalikan Production (Productions workflow) jika ada. |
| `app.project` | `Project` | Mengakses proyek tunggal yang sedang aktif di layar. |
| `app.projects` | `Collection` | Array proyek terbuka (mendukung multi-project). |
| `app.projectManager` | `ProjectManager` | Akses fitur Project Manager (konsolidasi, transcode). |
| `app.version` | `string` | Versi rilis Premiere Pro saat ini. |

### Metode Global `app`
| Method | Return / Type | Deskripsi |
| --- | --- | --- |
| `app.enableQE()` | `bool` | Mengaktifkan QE DOM rahasia (Undocumented). WAJIB dipanggil sebelum menggunakan `qe.*`. |
| `app.getCurrentProjectViewSelection()` | `Array` | Mengembalikan array ProjectItem yang dipilih di panel Project. |
| `app.isDocumentOpen()` | `bool` | Cek apakah ada proyek yang terbuka di sesi saat ini. |
| `app.newProject(path)` | `bool` | Membuat file .prproj baru di path yang ditentukan. |
| `app.openDocument(path)` | `bool` | Membuka file proyek .prproj. |
| `app.openFCPXML(path)` | `bool` | Impor/Buka file FCP XML. |
| `app.quit()` | `void` | Menutup paksa aplikasi Premiere Pro. |
| `app.setExtensionPersistent(id, state)` | `void` | state=1 mencegah script panel dimatikan oleh garbage collection. |
| `app.setSDKEventMessage(val, type)` | `bool` | Menulis log ke panel Events (type: 'warning', 'info', 'error'). |

## 🗂️ 3. Project (`app.project`)
### Properti Project
| Method / Property | Return / Type | Deskripsi |
| --- | --- | --- |
| `project.activeSequence` | `Sequence` | Sekuens yang saat ini sedang aktif di panel Timeline. |
| `project.documentID` | `string` | ID UUID unik untuk dokumen proyek tersebut. |
| `project.name` / `path` | `string` | Nama file / Path lengkap file proyek di disk. |
| `project.rootItem` | `ProjectItem` | Simpul akar tak terlihat yang membungkus semua Bin/Klip. |
| `project.sequences` | `Collection` | Koleksi semua sekuens (Sequence) di dalam proyek. Akses via `sequences[i]`, jumlah via `sequences.numItems`. |

### Metode Project
| Method | Return / Type | Deskripsi |
| --- | --- | --- |
| `project.closeDocument()` | `bool` | Menutup dokumen proyek aktif. |
| `project.createNewSequence(name, seqID)` | `Sequence` | Membuat sekuens kosong baru (alias `newSequence`). |
| `project.deleteAsset(projectItem)` | `bool` | Menghapus ProjectItem dari panel Project (bukan dari timeline). |
| `project.getInsertionBin()` | `ProjectItem` | Mengambil Bin yang sedang disorot/aktif di UI pengguna. |
| `project.importAEComps(path, comp)` | `bool` | Impor komposisi AE via Dynamic Link langsung. |
| `project.importFiles(paths, suppress, targetBin, asStills)` | `bool` | Impor deretan file ke dalam proyek. Arg pertama WAJIB array. |
| `project.importSequences(path)` | `bool` | Impor sekuens dari proyek lain. |
| `project.newSequence(name, id)` | `Sequence` | Membuat sekuens kosong baru. |
| `project.save()` / `saveAs(path)` | `bool` | Menyimpan perubahan ke disk. |

## 🎞️ 4. Pengelolaan Aset (ProjectItem & Metadata)
Setiap entitas di panel proyek (Klip, Bin, Audio) adalah `ProjectItem`.
### Properti ProjectItem
| Method / Property | Return / Type | Deskripsi |
| --- | --- | --- |
| `item.children` | `Collection` | Isi item turunan jika ia bertipe BIN atau ROOT. Akses jumlah via `children.numItems`. |
| `item.name` | `string` | Nama klip/bin yang tampil di layar (Baca/Tulis). |
| `item.nodeId` | `string` | ID Sesi acak; unik tiap import biarpun file medianya sama. |
| `item.treePath` | `string` | Path virtual posisi bin di dalam proyek (ex: \Root\Video\A.mp4). |
| `item.type` | `int` | 1=CLIP, 2=BIN, 3=ROOT, 4=FILE. |
| `item.getMediaPath()` | `string` | Path absolut ke file media sumber di disk. |

### Metode Klip/Media ProjectItem
| Method | Return / Type | Deskripsi |
| --- | --- | --- |
| `item.attachProxy(path, isHiRes)` | `int` | Lampirkan proxy luring (0) atau high-res (1) ke klip. |
| `item.canChangeMediaPath()` | `bool` | Cek apakah path media bisa diubah (relink). |
| `item.changeMediaPath(path, override)` | `int` | Relink klip ke file media baru/update lokasi disk. |
| `item.clearInPoint()` / `clearOutPoint()` | `void` | Hapus in/out point master. |
| `item.createSubClip(name, in, out, hard, v, a)` | `ProjectItem` | Membuat subklip virtual dari file mentah. |
| `item.getFootageInterpretation()` | `object` | Ambil metrik frame rate, alpha, dan interpretasi VR media. |
| `item.getMarkers()` | `MarkerCollection` | Mengambil marker koleksi pada level klip master. |
| `item.getProjectMetadata()` | `string` | Mengambil metadata XMP proyek dalam format XML string. |
| `item.getXMPMetadata()` | `string` | Mengambil metadata XMP file media dalam format XML string. |
| `item.isOffline()` | `bool` | Cek apakah file media sumber hilang/tidak bisa ditemukan di disk. |
| `item.isSequence()` | `bool` | Cek apakah item ini adalah sekuens (nested). |
| `item.refreshMedia()` | `void` | Refresh media (reload dari disk). |
| `item.setFootageInterpretation(obj)` | `bool` | Timpa setelan interpretasi klip dasar. |
| `item.setInPoint(sec, mediaType)` | `int` | Ubah in-point file master. 1=Vid, 2=Aud, 4=Semua. |
| `item.setOutPoint(sec, mediaType)` | `int` | Ubah out-point file master. |
| `item.setOverrideFrameRate(fps)` | `int` | Timpa FPS asli rekaman (mis. slowmo otomatis). |
| `item.setProjectMetadata(xml, fields)` | `void` | Menulis metadata XMP proyek. |
| `item.setXMPMetadata(xml)` | `bool` | Menulis metadata XMP ke file media. |

### Metode Bin ProjectItem
| Method | Return / Type | Deskripsi |
| --- | --- | --- |
| `item.createBin(name)` | `ProjectItem` | Buat folder bin baru di dalam item ini. |
| `item.createSmartBin(name, query)` | `ProjectItem` | Buat bin cerdas berdasarkan kueri metadata. |
| `item.deleteBin()` | `int` | Hapus bin beserta isinya dari proyek. |
| `item.moveBin(targetBinItem)` | `int` | Pindahkan item/bin ini ke dalam targetBinItem. |
| `item.renameBin(newName)` | `int` | Ganti nama bin. |
| `item.select()` | `void` | Sorot/pilih bin ini di panel Project. |

## 🎬 5. Sekuens (Sequence)
Objek wadah editor kanvas pemotongan Sequence.

| Method / Property | Return / Type | Deskripsi |
| --- | --- | --- |
| `seq.sequenceID` | `string` | UUID Absolut. Gunakan ini, BUKAN seq.id (buggy). |
| `seq.name` | `string` | Nama sequence (Baca/Tulis). |
| `seq.end` | `string` | Batas durasi timeline (Ticks). |
| `seq.timebase` | `string` | Rasio tick-ke-frame; ekuivalen FPS timeline. |
| `seq.frameSizeHorizontal` | `int` | Lebar resolusi sequence dalam pixel (ex: 1920). |
| `seq.frameSizeVertical` | `int` | Tinggi resolusi sequence dalam pixel (ex: 1080). |
| `seq.audioTracks` | `Collection` | Kumpulan audio track. Jumlah: `audioTracks.numTracks`. |
| `seq.videoTracks` | `Collection` | Kumpulan video track. Jumlah: `videoTracks.numTracks`. |
| `seq.markers` | `MarkerCollection` | Kumpulan markah penanda di atas penggaris sekuens. |
| `seq.projectItem` | `ProjectItem` | ProjectItem yang merepresentasikan sequence ini di Project panel. |
| `seq.autoReframeSequence(n, d, pre, nm, nest)` | `Sequence` | Pakai AI Adobe untuk resize rasio (mis: 9, 16 untuk TikTok). |
| `seq.clone()` | `Sequence` | Duplikasi sequence beserta seluruh isinya. |
| `seq.createSubsequence(hardBounds)` | `Sequence` | Buat subsequence dari area In/Out point. |
| `seq.exportAsMediaDirect(out, pre, area)` | `bool` | Render sekuens via engine internal (tanpa AME eksternal). |
| `seq.exportAsFinalCutProXML(path)` | `bool` | Buat file XML untuk round-trip/OTIO. |
| `seq.getExportFileExtension(presetPath)` | `string` | Mengembalikan ekstensi file berdasarkan preset. |
| `seq.getInPoint()` / `getOutPoint()` | `string` | Ticks In/Out point yang diset di timeline. |
| `seq.getPlayerPosition()` | `Time` | Titik playhead (CTI) saat ini. |
| `seq.setInPoint(ticks)` / `setOutPoint(ticks)` | `void` | Set In/Out point timeline (parameter = string ticks). |
| `seq.setPlayerPosition(ticks)` | `bool` | Pindahkan posisi CTI/playhead (Parameter harus string ticks). |
| `seq.setZeroPoint(ticks)` | `void` | Set timecode awal sequence (start time). |

## 🎧 6. Track & TrackItem (Klip Timeline)
### Track (Baris Horizontal di Timeline)
| Method / Property | Return / Type | Deskripsi |
| --- | --- | --- |
| `track.name` | `string` | Nama track (Baca/Tulis). |
| `track.id` | `int` | ID numerik track. |
| `track.mediaType` | `string` | "Video" atau "Audio". |
| `track.clips` | `Collection` | Array berurutan objek TrackItem (klip) di atas track ini. Akses total klip pakai `track.clips.numItems` (BUKAN length!). |
| `track.transitions` | `Collection` | Efek silang temporal (Cross Dissolve) antar klip. Jumlah: `transitions.numItems`. |
| `track.insertClip(projectItem, sec, vIdx, aIdx)` | `void` | Mendorong media ke timeline dan menggeser klip sebelahnya (Ripple). |
| `track.overwriteClip(projectItem, sec)` | `bool` | Memaksa tumpukan media tanpa menggeser (Destruktif). |
| `track.isMuted()` | `bool` | Cek apakah track sedang di-mute. |
| `track.setMute(1 / 0)` | `int` | Matikan/Nyalakan volume track keseluruhan. |
| `track.isLocked()` | `bool` | Cek apakah track sedang di-lock. |
| `track.setLocked(1 / 0)` | `int` | Kunci/Buka kunci track. |
| `track.isTargeted()` | `bool` | Cek apakah track ditarget (biru) untuk insert/overwrite. |
| `track.setTargeted(1 / 0, 1 / 0)` | `int` | Set targeting status track. |

**PENTING: CARA ITERASI KLIP (Wajib menggunakan numItems, bukan length)**
```javascript
// Contoh iterasi aman dari belakang ke depan (Mencegah pergeseran indeks jika ada penghapusan)
// 1. Iterasi Video Tracks
for (var i = 0; i < seq.videoTracks.numTracks; i++) {
    var track = seq.videoTracks[i];
    for (var j = track.clips.numItems - 1; j >= 0; j--) {
        var clip = track.clips[j];
        // eksekusi klip video
    }
}
// 2. Iterasi Audio Tracks
for (var i = 0; i < seq.audioTracks.numTracks; i++) {
    var track = seq.audioTracks[i];
    for (var j = track.clips.numItems - 1; j >= 0; j--) {
        var clip = track.clips[j];
        // eksekusi klip audio
    }
}
```

### TrackItem (Potongan Klip Fisik)
Wajib bedakan antara durasi absolut kanvas (start) dengan potongan referensi file master (inPoint).

| Method / Property | Return / Type | Deskripsi |
| --- | --- | --- |
| `clip.name` | `string` | Nama klip (READ ONLY di TrackItem! Untuk mengubah nama, akses `clip.projectItem.name`). |
| `clip.mediaType` | `string` | "Video" atau "Audio". |
| `clip.type` | `int` | Tipe TrackItem. 1 = klip biasa. |
| `clip.start` / `clip.end` | `Time` | Posisi koordinat absolut klip dari titik 0:0:0 kanvas. |
| `clip.inPoint` / `clip.outPoint` | `Time` | Posisi potongan klip berdasarkan frame asli file asal. |
| `clip.duration` | `Time` | Durasi aktual di timeline. |
| `clip.components` | `Collection` | Array komponen efek yang aktif di klip. Jumlah: `components.numItems`. Lihat section 7 untuk detail. |
| `clip.disabled` | `bool` | Toggle hidup/matinya klip (true=nonaktif, tersembunyi dari render). Baca/Tulis. |
| `clip.projectItem` | `ProjectItem` | Objek sumber asal klip tersebut di panel Project. |
| `clip.getMGTComponent(path, t, v, a)` | `Component` | Sisipkan .MOGRT (Motion Graphics) After Effects & bongkar parameternya. |
| `clip.getSpeed()` | `float` | Kecepatan playback klip (1.0 = 100%). |
| `clip.isAdjustmentLayer()` | `bool` | Cek apakah klip adalah adjustment layer. |
| `clip.isSpeedReversed()` | `bool` | Cek apakah klip di-reverse speed. |
| `clip.move(seconds)` | `int` | Menggeser blok klip ke kiri/kanan sebanyak N detik (float). |
| `clip.remove(ripple, align)` | `int` | Hapus klip dari timeline. Set ripple 1 untuk auto-tutup celah kosong. |
| `clip.setSpeed(speed, timeInterp, ripple)` | `int` | Ubah kecepatan klip. speed=float (1.0=100%), timeInterp=string kode temporal ("", "FrameBlending", dll). |

> **💡 TIPS CEK OFFLINE:** Objek `TrackItem` (klip timeline) **TIDAK** punya fungsi `isOffline()`. Untuk cek offline, **WAJIB** akses via `clip.projectItem.isOffline()`.

## 🎛️ 7. Efek & Komponen (Components, Params & Peta Lengkap)

### 7.1 Arsitektur Komponen
Setiap klip di timeline memiliki `clip.components` — sebuah Collection berisi objek `Component`. Setiap Component berisi `comp.properties` — Collection berisi `ComponentParam`.

**Hierarki:**
```
clip.components[0]              → Component (ex: Motion)
  └─ .properties[0]            → ComponentParam (ex: Anchor Point)
  └─ .properties[1]            → ComponentParam (ex: Position)
  └─ .properties[2]            → ComponentParam (ex: Scale)
clip.components[1]              → Component (ex: Opacity)
  └─ .properties[0]            → ComponentParam (ex: Opacity value)
clip.components[2+]            → Efek tambahan (Lumetri, Drop Shadow, dll)
```

### 7.2 Peta Komponen Default — Video Clip
Setiap video clip yang baru di-drop ke timeline **SELALU** memiliki 3 komponen bawaan:

| Index | matchName | displayName | Deskripsi |
| --- | --- | --- | --- |
| `components[0]` | `ADBE Motion` | Motion | Transform: posisi, skala, rotasi |
| `components[1]` | `ADBE Opacity` | Opacity | Transparansi dan blend mode |
| `components[2]` | `ADBE Time Remapping` | Time Remapping | Kontrol kecepatan berbasis keyframe |

**Detail Properties — Motion (`components[0]`):**
| Index | Property | Type | Nilai Default | Catatan |
| --- | --- | --- | --- | --- |
| `properties[0]` | Anchor Point | Array [x,y] | [960, 540] (half res) | Titik pusat transformasi |
| `properties[1]` | Position | Array [x,y] | [960, 540] | Posisi klip dalam canvas |
| `properties[2]` | Scale | float | 100 | Persentase skala. Uniform. |
| `properties[3]` | Scale Width | float | 100 | Hanya aktif jika Uniform Scale off |
| `properties[4]` | Rotation | float | 0 | Derajat rotasi (bisa negatif/lebih dari 360) |
| `properties[5]` | Anti-flicker Filter | float | 0 | Smoother untuk skala kecil |

**Detail Properties — Opacity (`components[1]`):**
| Index | Property | Type | Nilai Default | Catatan |
| --- | --- | --- | --- | --- |
| `properties[0]` | Opacity | float | 100 | 0=transparan, 100=penuh |

**Detail Properties — Time Remapping (`components[2]`):**
| Index | Property | Type | Catatan |
| --- | --- | --- | --- |
| `properties[0]` | Speed | float | Kecepatan berbasis keyframe |

### 7.3 Peta Komponen Default — Audio Clip
Audio clip di timeline (baik standalone atau linked dari video) memiliki komponen:

| Index | matchName | displayName | Deskripsi |
| --- | --- | --- | --- |
| `components[0]` | `ADBE Volume` | Volume | Level audio dalam dB |
| `components[1]` | `ADBE Panner` | Panner | Balance stereo (kiri/kanan) |

**Detail Properties — Volume (`components[0]`):**
| Index | Property | Type | Catatan |
| --- | --- | --- | --- |
| `properties[0]` | (Empty/Bypass) | bool | Switch bawaan (biasanya tanpa nama) |
| `properties[1]` | Level | float | Dalam dB. 0 = normal, -∞ = silence, +6 = boost |

**Detail Properties — Panner (`components[1]`):**
| Index | Property | Type | Catatan |
| --- | --- | --- | --- |
| `properties[0]` | Balance | float | -100=kiri, 0=center, 100=kanan |

### 7.4 Efek Tambahan (User-Applied)
Efek yang ditambahkan oleh user (Lumetri, Gaussian Blur, Drop Shadow, dll) ditambahkan ke `components` **setelah** komponen bawaan. Jadi efek pertama yang ditambahkan user ada di index `components[3]` untuk video, `components[2]` untuk audio.

**Cara menemukan efek tertentu berdasarkan matchName:**
```javascript
function findEffect(clip, matchName) {
    for (var i = 0; i < clip.components.numItems; i++) {
        if (clip.components[i].matchName === matchName) {
            return clip.components[i];
        }
    }
    return null;
}
// Contoh: Cari Lumetri Color
var lumetri = findEffect(clip, "ADBE Lumetri");
```

**Cara menemukan efek berdasarkan displayName:**
```javascript
function findEffectByName(clip, name) {
    for (var i = 0; i < clip.components.numItems; i++) {
        if (clip.components[i].displayName === name) {
            return clip.components[i];
        }
    }
    return null;
}
var shadow = findEffectByName(clip, "Drop Shadow");
```

**Cara mendaftar SEMUA komponen dan properti klip (debugging):**
```javascript
var clip = seq.videoTracks[0].clips[0];
var info = [];
for (var i = 0; i < clip.components.numItems; i++) {
    var comp = clip.components[i];
    var props = [];
    for (var p = 0; p < comp.properties.numItems; p++) {
        props.push(comp.properties[p].displayName);
    }
    info.push("[" + i + "] " + comp.displayName + " (" + comp.matchName + "): " + props.join(", "));
}
return info.join(" | ");
```

### 7.5 Component API
| Method / Property | Return / Type | Deskripsi |
| --- | --- | --- |
| `comp.displayName` | `string` | Nama lokal untuk UI (ex: "Lumetri Color"). |
| `comp.matchName` | `string` | ID Mesin absolut (ex: "ADBE Lumetri Color", "ADBE Motion"). |
| `comp.properties` | `Collection` | Array anak ComponentParam. Jumlah: `properties.numItems`. |

### 7.6 ComponentParam API (Parameter Pengaturan)
Otomatisasi butuh argumen `updateUI` bernilai 1 agar layar editor ikut berubah saat parameter di-set via script.

| Method / Property | Return / Type | Deskripsi |
| --- | --- | --- |
| `param.displayName` | `string` | Nama parameter yang ditampilkan di UI. |
| `param.getValue()` | `varies` | Ambil nilai konstan statis parameter. |
| `param.setValue(val, updateUI)` | `int` | Setel nilai konstan statis. Set updateUI ke 1 untuk visual. |
| `param.setColorValue(a, r, g, b, ui)` | `int` | Ubah variabel warna spektrum. a=alpha, r/g/b = 0-255. |
| `param.areKeyframesSupported()` | `bool` | Cek apakah parameter ini mendukung keyframe. |
| `param.isTimeVarying()` | `bool` | Cek apakah keyframe sedang aktif. |
| `param.setTimeVarying(bool)` | `int` | Aktifkan/nonaktifkan fungsionalitas animasi Keyframe. |
| `param.addKey(time)` | `int` | Buat titik pin keyframe baru di detik target (float). |
| `param.getKeys()` | `Array` | Mengembalikan array waktu (seconds) semua keyframe yang ada. |
| `param.getValueAtKey(time)` | `varies` | Baca nilai di keyframe tertentu. |
| `param.setValueAtKey(time, val, ui)` | `int` | Berikan/ubah angka nilai pada keyframe tertentu. |
| `param.setInterpolationTypeAtKey(t, m, u)` | `int` | Atur tipe kelandaian: 0=Linear, 4=Hold, 5=Bezier, 6=Time. |
| `param.removeKey(time)` | `int` | Hapus keyframe tunggal. |
| `param.removeKeyRange(startTime, endTime)` | `int` | Hapus semua keyframe dalam rentang waktu. |
| `param.findNearestKey(time, threshold)` | `Time` | Cari keyframe terdekat dari posisi waktu. |
| `param.keyExistsAtTime(time)` | `bool` | Cek apakah ada keyframe di waktu tertentu. |

### 7.7 matchName Efek Umum (Referensi Cepat)
| matchName | Nama Efek | Kategori |
| --- | --- | --- |
| `ADBE Motion` | Motion | Transform (bawaan) |
| `ADBE Opacity` | Opacity | Transparansi (bawaan) |
| `ADBE Time Remapping` | Time Remapping | Speed (bawaan) |
| `ADBE Volume` | Volume | Audio (bawaan) |
| `ADBE Panner` | Panner | Audio (bawaan) |
| `ADBE Lumetri` | Lumetri Color | Color Correction |
| `ADBE Gaussian Blur 2` | Gaussian Blur | Blur & Sharpen |
| `AE.ADBE Drop Shadow` | Drop Shadow | Perspective |
| `ADBE Basic 3D` | Basic 3D | Perspective |
| `AE.ADBE Geometry2` | Transform | Distort |
| `ADBE Sharpen` | Sharpen | Blur & Sharpen |
| `AE.ADBE Fill` | Fill | Generate |

## 📌 8. Markers (Markah)
Marker dikelola oleh `MarkerCollection` dan ada pada klip (`item.getMarkers()`) maupun timeline (`seq.markers`).

| Method / Property | Return / Type | Deskripsi |
| --- | --- | --- |
| `markers.numMarkers` | `int` | Jumlah marker dalam koleksi. |
| `markers.createMarker(sec)` | `Marker` | Buat penanda di titik waktu Float detik. |
| `markers.deleteMarker(marker)` | `bool` | Hapus instansi penanda tersebut. |
| `markers.getFirstMarker()` | `Marker` | Mengambil marker pertama (untuk iterasi). |
| `markers.getNextMarker(marker)` | `Marker` | Mengambil marker berikutnya setelah marker yang diberikan. |
| `markers.getLastMarker()` | `Marker` | Mengambil marker terakhir. |
| `marker.name` | `string` | (Atribut) Teks label markah (Baca/Tulis). |
| `marker.comments` | `string` | (Atribut) Isi badan catatan markah (Baca/Tulis). |
| `marker.start` / `end` | `Time` | (Atribut) Ticks awal dan rentang durasi markah. |
| `marker.type` | `string` | Tipe marker: "Comment", "Chapter", "Segmentation", dll. |
| `marker.setTypeAsChapter()` | `int` | Ubah fungsionalitas marker menjadi pembelah bab (chapters). |
| `marker.setTypeAsComment()` | `int` | Ubah marker menjadi komentar biasa. |
| `marker.setTypeAsSegmentation()` | `int` | Ubah marker menjadi segmentation. |
| `marker.setTypeAsWebLink(url, target)` | `int` | Ubah marker menjadi web link. |
| `marker.setColorByIndex(col, idx)` | `void` | 0=Hijau, 1=Merah, 2=Ungu, 3=Oranye, 4=Kuning, 5=Putih, 6=Biru, 7=Cyan. |
| `marker.getColorByIndex()` | `int` | Mengembalikan index warna marker. |

## 📤 9. Otomatisasi Adobe Media Encoder (`app.encoder`)
Jembatan API eksternal yang di-hosting untuk mengantre render di latar belakang.

| Method | Deskripsi |
| --- | --- |
| `encoder.launchEncoder()` | Membuka AME ke memori komputer pengguna. |
| `encoder.encodeSequence(seq, out, preset, area, rm)` | Lempar sekuens ke AME. area: 0=Seluruhnya, 1=In-Out, 2=Work Area. |
| `encoder.encodeFile(file, out, pre, area, rm, in, out)` | Transcode mentah langsung di AME tanpa timeline Premiere. |
| `encoder.encodeProjectItem(item, out, pre, area, rm)` | Render ProjectItem spesifik via AME. |
| `encoder.startBatch()` | Mulai tombol render pada AME secara paksa. |
| `encoder.setSidecarXMPEnabled(1/0)` | Aktifkan/nonaktifkan sidecar XMP file. |
| `encoder.setEmbeddedXMPEnabled(1/0)` | Aktifkan perekaman Metadata turunan atau pelacakan kredensial AI ke file. |

## 🚀 10. UXP API & Fitur Terbaru (2025 - 2026)
Integrasi UXP memungkinkan pembuatan panel interaktif dan akses asynchronous standar ECMAScript tanpa memblokir UI. Semua skrip UXP wajib mengimpor module `const app = require('premierepro')`.

**Kelas Baru Khusus UXP**
- `CaptionTrack` (Subtitel): Objek trek baru khusus takarir dengan metode `getTrackItems()` dan properti ID trek.
- `SequenceEditor`: Memanipulasi klip khusus tingkat UI (Contoh fungsi: menyisipkan .mogrt via `insertMogrtFromPath()`).
- `Transcript` (Text-Based Editing AI): Fungsionalitas revolusioner baru menggunakan `Transcript.createImportTextSegmentsAction(textSegments, clipProjectItem)` yang memungkinkan NLP/AI Anda memasukkan kembali teks transkripsi dari JSON secara langsung ke klip mentah.
- **Sistem Events (Asynchronous)**: Anda tidak perlu lagi melakukan polling terus-menerus. Bind listener langsung ke kejadian aplikasi seperti `OperationCompleteEvent`, `ProjectClosedEvent`, dan pelacak `EVENT_TRACK_CHANGED`.

## 🕵️ 11. QE DOM (Quality Engineering - Undocumented) — PANDUAN LENGKAP

QE DOM adalah API rahasia berlapis ganda yang sangat kuat namun undocumented. **WAJIB** dipanggil `app.enableQE()` terlebih dahulu. QE DOM adalah **SATU-SATUNYA** cara untuk menambahkan efek baru dan transisi ke klip via script.

### 11.1 Aktivasi & Akses Dasar
```javascript
app.enableQE();
var qeSeq = qe.project.getActiveSequence();
```

### 11.2 QE Project
| Method | Deskripsi |
| --- | --- |
| `qe.project.getActiveSequence()` | Mengembalikan QE Sequence aktif. |
| `qe.project.getVideoEffectByName(name)` | Cari efek video berdasarkan nama (ex: "Drop Shadow", "Gaussian Blur"). |
| `qe.project.getAudioEffectByName(name)` | Cari efek audio berdasarkan nama. |
| `qe.project.getVideoTransitionByName(name)` | Cari transisi video (ex: "Cross Dissolve", "Dip to Black"). |
| `qe.project.getAudioTransitionByName(name)` | Cari transisi audio (ex: "Constant Power"). |
| `qe.project.deletePreviewFiles()` | Membersihkan cache render (merah/hijau) di timeline secara instan. |
| `qe.project.importFiles(arrayPaths)` | Impor file via QE. |

### 11.3 QE Sequence
| Method | Deskripsi |
| --- | --- |
| `qeSeq.getVideoTrackAt(index)` | Akses video track berdasarkan index (0-based). |
| `qeSeq.getAudioTrackAt(index)` | Akses audio track berdasarkan index (0-based). |
| `qeSeq.addTracks(numVideo, numAudio, numSubmix)` | Tambah track baru ke sequence. |
| `qeSeq.razor(ticks)` | Membelah SEMUA klip di semua track di posisi ticks (blade tool). |
| `qeSeq.getPlayerPosition()` | Posisi playhead QE. |
| `qeSeq.setPlayerPosition(ticks)` | Set playhead QE. |

### 11.4 QE Track & TrackItem
| Method | Deskripsi |
| --- | --- |
| `qeTrack.getItemAt(index)` | Akses QE TrackItem berdasarkan index (0-based). |
| `qeTrack.numItems` | Jumlah item di track. |
| `qeItem.addVideoEffect(qeEffect)` | **MENAMBAHKAN** efek video baru ke klip. |
| `qeItem.addAudioEffect(qeEffect)` | **MENAMBAHKAN** efek audio baru ke klip. |
| `qeItem.addTransition(qeTransition, atEnd, dur)` | **MENAMBAHKAN** transisi ke klip. atEnd=true untuk di akhir klip. |
| `qeItem.remove(ripple)` | Hapus klip via QE. |
| `qeItem.rippleDelete()` | Hapus klip + tutup gap otomatis. |

### 11.5 Pola Lengkap: Tambah Efek ke Klip
```javascript
app.enableQE();
var qeSeq = qe.project.getActiveSequence();
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var count = 0;

// Tambah Drop Shadow ke semua klip di V1
var qeTrack = qeSeq.getVideoTrackAt(0);
var track = seq.videoTracks[0];
for (var j = 0; j < track.clips.numItems; j++) {
    var qeItem = qeTrack.getItemAt(j);
    var effect = qe.project.getVideoEffectByName("Drop Shadow");
    if (effect) {
        qeItem.addVideoEffect(effect);
        count++;
    }
}
return "Drop Shadow ditambahkan ke " + count + " klip.";
```

### 11.6 Pola Lengkap: Tambah Transisi Antar Klip
```javascript
app.enableQE();
var qeSeq = qe.project.getActiveSequence();
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var count = 0;

var transition = qe.project.getVideoTransitionByName("Cross Dissolve");
if (!transition) return "Error: Transisi tidak ditemukan.";

var qeTrack = qeSeq.getVideoTrackAt(0);
var track = seq.videoTracks[0];
for (var j = 0; j < track.clips.numItems; j++) {
    var qeItem = qeTrack.getItemAt(j);
    try {
        // Tambah transisi di akhir klip (kecuali klip terakhir)
        if (j < track.clips.numItems - 1) {
            qeItem.addTransition(transition, true, "30"); // 30 frames
            count++;
        }
    } catch(e) {} // Skip jika gagal (misal: overlap tidak cukup)
}
return "Cross Dissolve ditambahkan di " + count + " titik potong.";
```

### 11.7 Nama Efek & Transisi Umum (untuk getVideoEffectByName / getVideoTransitionByName)

**Efek Video (parameter = nama persis):**
| Nama | Kategori |
| --- | --- |
| `"Drop Shadow"` | Perspective |
| `"Gaussian Blur"` | Blur & Sharpen |
| `"Sharpen"` | Blur & Sharpen |
| `"Lumetri Color"` | Color Correction |
| `"Crop"` | Transform |
| `"Black & White"` | Image Control |
| `"Warp Stabilizer"` | Distort |
| `"Ultra Key"` | Keying |
| `"Transform"` | Distort |
| `"Mirror"` | Distort |
| `"Mosaic"` | Stylize |

**Transisi Video:**
| Nama | Kategori |
| --- | --- |
| `"Cross Dissolve"` | Dissolve |
| `"Dip to Black"` | Dissolve |
| `"Dip to White"` | Dissolve |
| `"Film Dissolve"` | Dissolve |
| `"Morph Cut"` | Dissolve |
| `"Push"` | Slide |
| `"Slide"` | Slide |
| `"Wipe"` | Wipe |

**Transisi Audio:**
| Nama | Kategori |
| --- | --- |
| `"Constant Power"` | Crossfade |
| `"Constant Gain"` | Crossfade |
| `"Exponential Fade"` | Crossfade |

---

## 🧠 12. COOKBOOK — Pola Kode Lengkap untuk AI

Bagian ini berisi pola logika lengkap yang WAJIB dijadikan fondasi saat AI men-generate kode ExtendScript. Setiap pola sudah diverifikasi aman dan kompatibel dengan mesin ExtendScript (ES3) Premiere Pro.

> **📐 INSTRUKSI UNTUK AI — ANALISIS STRUKTUR:**
> Jika user meminta operasi yang **TIDAK ADA** contoh persisnya di cookbook ini, **JANGAN** menolak atau halusinasi. Sebaliknya, **analisis struktur** dari pola-pola di bawah dan **komposisikan** solusi baru dari blok-blok yang sudah terbukti valid:
> 1. **Identifikasi target** — Apakah operasi ini menyentuh klip timeline (`TrackItem`), aset project (`ProjectItem`), marker, efek, atau sequence?
> 2. **Pilih pola iterasi** yang cocok — Mundur jika hapus, maju jika baca. Timeline pakai `numTracks`/`numItems`, Project Bin pakai rekursi `children.numItems`.
> 3. **Pilih kondisi filter** — Gabungkan properti yang tersedia dari tabel API di atas (section 1-11) ke dalam `if()` statement.
> 4. **Rakit dari blok yang ada** — Gunakan boilerplate (12.1), pola iterasi (12.2), lalu sisipkan logika spesifik dari permintaan user.
> 5. **Selalu return hasil** — Deskriptif, menyebutkan jumlah item yang terpengaruh.
>
> Contoh penalaran: User minta *"tambah drop shadow ke semua klip"* → Gunakan boilerplate (12.1) + QE DOM activation (11.5) + iterasi maju track (12.2) + `qeItem.addVideoEffect()` dari section 11.4.

### 🔧 12.1 Boilerplate Dasar (Wajib Diikuti)
Semua script yang di-generate HARUS mengikuti pola ini:
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var count = 0;
// ... logika operasi ...
return "Selesai. " + count + " item diproses.";
```
- Selalu cek `activeSequence` di awal.
- Selalu `return` string deskriptif di akhir.
- Gunakan `var` (bukan `let`/`const` — ExtendScript = ES3).

---

### 🔄 12.2 Iterasi Klip di Timeline
Semua operasi yang menyentuh klip di timeline WAJIB menggunakan pola ini. **JANGAN** pakai `.length` — pakai `.numTracks` dan `.numItems`.

**Iterasi maju (untuk baca/analisis — TIDAK menghapus):**
```javascript
var seq = app.project.activeSequence;
for (var i = 0; i < seq.videoTracks.numTracks; i++) {
    var track = seq.videoTracks[i];
    for (var j = 0; j < track.clips.numItems; j++) {
        var clip = track.clips[j];
        // baca properti clip
    }
}
```

**Iterasi mundur (WAJIB jika ada penghapusan/modifikasi yang mengubah jumlah klip):**
```javascript
var seq = app.project.activeSequence;
var count = 0;
// Video tracks
for (var i = 0; i < seq.videoTracks.numTracks; i++) {
    var track = seq.videoTracks[i];
    for (var j = track.clips.numItems - 1; j >= 0; j--) {
        var clip = track.clips[j];
        if (/* kondisi */) {
            clip.remove(1, 1);
            count++;
        }
    }
}
// Audio tracks
for (var i = 0; i < seq.audioTracks.numTracks; i++) {
    var track = seq.audioTracks[i];
    for (var j = track.clips.numItems - 1; j >= 0; j--) {
        var clip = track.clips[j];
        if (/* kondisi */) {
            clip.remove(1, 1);
            count++;
        }
    }
}
return "Dihapus: " + count + " klip.";
```

> ⚠️ **KRITIS:** Jika iterasi maju + hapus, indeks bergeser dan klip terlewat. SELALU mundur jika menghapus.

---

### 🗑️ 12.3 Hapus Klip Disabled
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var count = 0;
for (var i = 0; i < seq.videoTracks.numTracks; i++) {
    var track = seq.videoTracks[i];
    for (var j = track.clips.numItems - 1; j >= 0; j--) {
        if (track.clips[j].disabled === true) {
            track.clips[j].remove(1, 1);
            count++;
        }
    }
}
for (var i = 0; i < seq.audioTracks.numTracks; i++) {
    var track = seq.audioTracks[i];
    for (var j = track.clips.numItems - 1; j >= 0; j--) {
        if (track.clips[j].disabled === true) {
            track.clips[j].remove(1, 1);
            count++;
        }
    }
}
return "Dihapus: " + count + " klip disabled.";
```

---

### 📴 12.4 Hapus Klip Offline (Media Hilang)
> **PENTING:** `isOffline()` hanya ada di `ProjectItem`, TIDAK ada di `TrackItem`.

```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var count = 0;
for (var i = 0; i < seq.videoTracks.numTracks; i++) {
    var track = seq.videoTracks[i];
    for (var j = track.clips.numItems - 1; j >= 0; j--) {
        var clip = track.clips[j];
        if (clip.projectItem && clip.projectItem.isOffline()) {
            clip.remove(1, 1);
            count++;
        }
    }
}
for (var i = 0; i < seq.audioTracks.numTracks; i++) {
    var track = seq.audioTracks[i];
    for (var j = track.clips.numItems - 1; j >= 0; j--) {
        var clip = track.clips[j];
        if (clip.projectItem && clip.projectItem.isOffline()) {
            clip.remove(1, 1);
            count++;
        }
    }
}
return "Dihapus: " + count + " klip offline.";
```

---

### 📊 12.5 Kumpulkan Informasi Timeline
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var info = [];
info.push("Sequence: " + seq.name);
info.push("Resolution: " + seq.frameSizeHorizontal + "x" + seq.frameSizeVertical);
info.push("Duration: " + (parseFloat(seq.end) / 254016000000).toFixed(2) + "s");

var totalClips = 0;
for (var i = 0; i < seq.videoTracks.numTracks; i++) {
    var n = seq.videoTracks[i].clips.numItems;
    if (n > 0) info.push("V" + (i+1) + ": " + n + " clips");
    totalClips += n;
}
for (var i = 0; i < seq.audioTracks.numTracks; i++) {
    var n = seq.audioTracks[i].clips.numItems;
    if (n > 0) info.push("A" + (i+1) + ": " + n + " clips");
    totalClips += n;
}
info.push("Total: " + totalClips);
return info.join(" | ");
```

---

### 📁 12.6 Traversal Rekursif Project Bin
```javascript
function scanBin(parentItem, results) {
    for (var i = 0; i < parentItem.children.numItems; i++) {
        var child = parentItem.children[i];
        if (child.type === 2) { // BIN
            scanBin(child, results);
        } else if (child.type === 1) { // CLIP
            results.push(child);
        }
    }
}
var allClips = [];
scanBin(app.project.rootItem, allClips);
return "Project berisi " + allClips.length + " media items.";
```

**Hapus semua media offline dari Project Panel:**
```javascript
function removeOfflineFromBin(parentItem) {
    var count = 0;
    for (var i = parentItem.children.numItems - 1; i >= 0; i--) {
        var child = parentItem.children[i];
        if (child.type === 2) {
            count += removeOfflineFromBin(child);
        } else if (child.type === 1 && child.isOffline()) {
            app.project.deleteAsset(child);
            count++;
        }
    }
    return count;
}
var removed = removeOfflineFromBin(app.project.rootItem);
return "Dihapus " + removed + " item offline dari Project.";
```

---

### ✂️ 12.7 Razor / Split di Posisi Playhead
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
app.enableQE();
var qeSeq = qe.project.getActiveSequence();
var playhead = seq.getPlayerPosition();
qeSeq.razor(playhead.ticks);
return "Razor di " + parseFloat(playhead.seconds).toFixed(2) + "s.";
```

---

### 🎨 12.8 Manipulasi Efek — Motion & Opacity

**Set opacity semua klip di V1 ke 50%:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var count = 0;
var track = seq.videoTracks[0];
for (var j = 0; j < track.clips.numItems; j++) {
    var clip = track.clips[j];
    clip.components[1].properties[0].setValue(50, 1);
    count++;
}
return "Opacity diset ke 50% untuk " + count + " klip.";
```

**Scale semua klip ke 50%:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var count = 0;
for (var i = 0; i < seq.videoTracks.numTracks; i++) {
    var track = seq.videoTracks[i];
    for (var j = 0; j < track.clips.numItems; j++) {
        var clip = track.clips[j];
        clip.components[0].properties[2].setValue(50, 1); // Scale = index 2
        count++;
    }
}
return "Scale diset ke 50% untuk " + count + " klip.";
```

**Rotasi semua klip 90 derajat:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var count = 0;
for (var i = 0; i < seq.videoTracks.numTracks; i++) {
    var track = seq.videoTracks[i];
    for (var j = 0; j < track.clips.numItems; j++) {
        var clip = track.clips[j];
        clip.components[0].properties[4].setValue(90, 1); // Rotation = index 4
        count++;
    }
}
return "Rotasi 90° untuk " + count + " klip.";
```

---

### ✨ 12.9 Animasi Keyframe

**Fade-in opacity (0→100 dalam 1 detik):**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var clip = seq.videoTracks[0].clips[0];
if (!clip) return "Error: Tidak ada klip di V1.";

var opacParam = clip.components[1].properties[0];
var startSec = parseFloat(clip.start.seconds);

opacParam.setTimeVarying(true);
opacParam.addKey(startSec);
opacParam.setValueAtKey(startSec, 0, 1);
opacParam.addKey(startSec + 1.0);
opacParam.setValueAtKey(startSec + 1.0, 100, 1);

return "Fade-in 1 detik diterapkan di klip pertama V1.";
```

**Fade-out opacity (100→0 dalam 1 detik dari akhir):**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var clip = seq.videoTracks[0].clips[0];
if (!clip) return "Error: Tidak ada klip di V1.";

var opacParam = clip.components[1].properties[0];
var endSec = parseFloat(clip.end.seconds);

opacParam.setTimeVarying(true);
opacParam.addKey(endSec - 1.0);
opacParam.setValueAtKey(endSec - 1.0, 100, 1);
opacParam.addKey(endSec);
opacParam.setValueAtKey(endSec, 0, 1);

return "Fade-out 1 detik diterapkan.";
```

**Scale animasi (zoom in dari 100→150 selama durasi klip):**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var clip = seq.videoTracks[0].clips[0];
if (!clip) return "Error: Tidak ada klip di V1.";

var scaleParam = clip.components[0].properties[2];
var startSec = parseFloat(clip.start.seconds);
var endSec = parseFloat(clip.end.seconds);

scaleParam.setTimeVarying(true);
scaleParam.addKey(startSec);
scaleParam.setValueAtKey(startSec, 100, 1);
scaleParam.addKey(endSec);
scaleParam.setValueAtKey(endSec, 150, 1);

return "Zoom in 100→150% diterapkan.";
```

**Hapus semua keyframe dari parameter tertentu:**
```javascript
var clip = seq.videoTracks[0].clips[0];
var param = clip.components[1].properties[0]; // Opacity
var keys = param.getKeys();
if (keys) {
    for (var k = keys.length - 1; k >= 0; k--) {
        param.removeKey(keys[k]);
    }
}
param.setTimeVarying(false);
param.setValue(100, 1);
return "Semua keyframe opacity dihapus, reset ke 100%.";
```

---

### 🎵 12.10 Manipulasi Audio

**Set volume semua audio ke -6dB:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var count = 0;
for (var i = 0; i < seq.audioTracks.numTracks; i++) {
    var track = seq.audioTracks[i];
    for (var j = 0; j < track.clips.numItems; j++) {
        var clip = track.clips[j];
        clip.components[0].properties[1].setValue(-6, 1); // Volume Level ada di properties[1]
        count++;
    }
}
return "Volume diset ke -6dB untuk " + count + " audio clips.";
```

**Mute semua audio track:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
for (var i = 0; i < seq.audioTracks.numTracks; i++) {
    seq.audioTracks[i].setMute(1);
}
return "Semua " + seq.audioTracks.numTracks + " audio track di-mute.";
```

**Audio fade-in (silence → full volume):**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var clip = seq.audioTracks[0].clips[0];
if (!clip) return "Error: Tidak ada klip di A1.";

var volParam = clip.components[0].properties[1]; // Level
var startSec = parseFloat(clip.start.seconds);

volParam.setTimeVarying(true);
volParam.addKey(startSec);
volParam.setValueAtKey(startSec, -96, 1); // -96dB ≈ silence
volParam.addKey(startSec + 2.0);
volParam.setValueAtKey(startSec + 2.0, 0, 1); // 0dB = normal
return "Audio fade-in 2 detik diterapkan.";
```

---

### 📌 12.11 Operasi Marker

**Tambah marker di posisi playhead:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var pos = seq.getPlayerPosition();
var newMarker = seq.markers.createMarker(parseFloat(pos.seconds));
newMarker.name = "Marker Baru";
newMarker.comments = "Ditambahkan via AI script";
newMarker.setColorByIndex(0, 0);
return "Marker ditambahkan di " + parseFloat(pos.seconds).toFixed(2) + "s.";
```

**Hapus semua marker:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var markers = seq.markers;
var count = 0;
var toDelete = [];
var m = markers.getFirstMarker();
while (m) {
    toDelete.push(m);
    m = markers.getNextMarker(m);
}
for (var i = 0; i < toDelete.length; i++) {
    markers.deleteMarker(toDelete[i]);
    count++;
}
return "Dihapus: " + count + " marker.";
```

**Buat marker di setiap titik potong klip:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var count = 0;
var track = seq.videoTracks[0];
for (var j = 0; j < track.clips.numItems; j++) {
    var clip = track.clips[j];
    var sec = parseFloat(clip.start.seconds);
    var m = seq.markers.createMarker(sec);
    m.name = "Cut " + (j + 1);
    m.setColorByIndex(0, 4); // Kuning
    count++;
}
return "Dibuat " + count + " marker di titik potong.";
```

---

### ⏩ 12.12 Speed & Durasi

**Ubah kecepatan klip:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var clip = seq.videoTracks[0].clips[0];
if (!clip) return "Error: Tidak ada klip di V1.";

// 2.0 = 200% speed (2x lebih cepat), 0.5 = 50% speed (slow motion)
clip.setSpeed(2.0, "", true); // arg3 = ripple
return "Speed diset ke 200% (" + clip.getSpeed() + "x).";
```

---

### 🔀 12.13 Playhead & Navigasi

**Pindahkan playhead ke awal:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
seq.setPlayerPosition("0");
return "Playhead dipindahkan ke awal.";
```

**Pindahkan playhead ke detik tertentu:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var targetSec = 10;
seq.setPlayerPosition(String(targetSec * 254016000000));
return "Playhead dipindahkan ke " + targetSec + " detik.";
```

**Pindahkan playhead ke akhir sequence:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
seq.setPlayerPosition(seq.end);
return "Playhead dipindahkan ke akhir sequence.";
```

---

### 📐 12.14 Hitung Durasi & Statistik

**Hitung durasi per track:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var info = [];
for (var i = 0; i < seq.videoTracks.numTracks; i++) {
    var track = seq.videoTracks[i];
    if (track.clips.numItems === 0) continue;
    var totalSec = 0;
    for (var j = 0; j < track.clips.numItems; j++) {
        totalSec += parseFloat(track.clips[j].duration.seconds);
    }
    info.push("V" + (i+1) + ": " + track.clips.numItems + " klip, " + totalSec.toFixed(1) + "s");
}
return info.join(" | ");
```

---

### 🎬 12.15 Tambah Efek via QE DOM

**Tambah efek tertentu ke semua klip di track tertentu:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
app.enableQE();
var qeSeq = qe.project.getActiveSequence();
var count = 0;

var effectName = "Drop Shadow"; // Ganti sesuai kebutuhan
var effect = qe.project.getVideoEffectByName(effectName);
if (!effect) return "Error: Efek '" + effectName + "' tidak ditemukan.";

// Terapkan ke semua klip di semua video track
for (var i = 0; i < seq.videoTracks.numTracks; i++) {
    var track = seq.videoTracks[i];
    var qeTrack = qeSeq.getVideoTrackAt(i);
    for (var j = 0; j < track.clips.numItems; j++) {
        var qeItem = qeTrack.getItemAt(j);
        try {
            qeItem.addVideoEffect(effect);
            count++;
        } catch(e) {}
    }
}
return effectName + " ditambahkan ke " + count + " klip.";
```

**Tambah transisi di semua titik potong:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
app.enableQE();
var qeSeq = qe.project.getActiveSequence();
var count = 0;

var trans = qe.project.getVideoTransitionByName("Cross Dissolve");
if (!trans) return "Error: Transisi tidak ditemukan.";

for (var i = 0; i < seq.videoTracks.numTracks; i++) {
    var track = seq.videoTracks[i];
    var qeTrack = qeSeq.getVideoTrackAt(i);
    for (var j = 0; j < track.clips.numItems - 1; j++) {
        try {
            var qeItem = qeTrack.getItemAt(j);
            qeItem.addTransition(trans, true, "15"); // 15 frames
            count++;
        } catch(e) {}
    }
}
return "Cross Dissolve ditambahkan di " + count + " titik potong.";
```

---

### 🏷️ 12.16 Rename & Organisasi

**Rename klip berdasarkan urutan:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var count = 0;
for (var i = 0; i < seq.videoTracks.numTracks; i++) {
    var track = seq.videoTracks[i];
    for (var j = 0; j < track.clips.numItems; j++) {
        var clip = track.clips[j];
        if (clip.projectItem) {
            clip.projectItem.name = "V" + (i+1) + "_CLIP_" + (j+1);
            count++;
        }
    }
}
return "Renamed " + count + " klip.";
```
> ⚠️ `projectItem.name` mengubah nama di panel Project (master).

---

### 🔧 12.17 Disable/Enable Klip

**Disable semua klip di track tertentu:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var count = 0;
var track = seq.videoTracks[2]; // V3
for (var j = 0; j < track.clips.numItems; j++) {
    track.clips[j].disabled = true;
    count++;
}
return "Disabled " + count + " klip di V3.";
```

**Enable semua klip disabled:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var count = 0;
for (var i = 0; i < seq.videoTracks.numTracks; i++) {
    var track = seq.videoTracks[i];
    for (var j = 0; j < track.clips.numItems; j++) {
        if (track.clips[j].disabled) {
            track.clips[j].disabled = false;
            count++;
        }
    }
}
return "Enabled " + count + " klip.";
```

---

### 📂 12.18 Import Media ke Project

**Import file ke project root:**
```javascript
var filePaths = ["/path/to/video.mp4", "/path/to/audio.wav"];
app.project.importFiles(filePaths, true, app.project.rootItem, false);
return "Imported " + filePaths.length + " files.";
```

**Import file ke bin tertentu:**
```javascript
// Cari bin bernama "Footage"
function findBin(parent, name) {
    for (var i = 0; i < parent.children.numItems; i++) {
        var child = parent.children[i];
        if (child.type === 2 && child.name === name) return child;
        if (child.type === 2) {
            var found = findBin(child, name);
            if (found) return found;
        }
    }
    return null;
}
var bin = findBin(app.project.rootItem, "Footage");
if (!bin) {
    bin = app.project.rootItem.createBin("Footage");
}
app.project.importFiles(["/path/to/file.mp4"], true, bin, false);
return "File imported ke bin 'Footage'.";
```

---

### 🎞️ 12.19 Sequence Operations

**Duplikat sequence aktif:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var newSeq = seq.clone();
return "Sequence diduplikat: " + newSeq.name;
```

**List semua sequence di project:**
```javascript
var seqs = app.project.sequences;
var info = [];
for (var i = 0; i < seqs.numItems; i++) {
    info.push(seqs[i].name);
}
return "Sequences: " + info.join(", ");
```

---

### 🔍 12.20 Debug & Inspeksi

**List semua efek/komponen di klip pertama V1:**
```javascript
var seq = app.project.activeSequence;
if (!seq) return "Error: Tidak ada sequence aktif.";
var clip = seq.videoTracks[0].clips[0];
if (!clip) return "Error: Tidak ada klip di V1.";
var info = [];
for (var i = 0; i < clip.components.numItems; i++) {
    var comp = clip.components[i];
    var propNames = [];
    for (var p = 0; p < comp.properties.numItems; p++) {
        var param = comp.properties[p];
        var val = "";
        try { val = " = " + param.getValue(); } catch(e) {}
        propNames.push(param.displayName + val);
    }
    info.push("[" + i + "] " + comp.displayName + " (" + comp.matchName + "): {" + propNames.join(", ") + "}");
}
return info.join(" || ");
```

---

## ⛔ 13. DAFTAR LARANGAN — Fungsi yang TIDAK ADA

Berikut fungsi yang **TIDAK EKSIS** di API Premiere Pro ExtendScript. AI **DILARANG KERAS** memanggilnya:

| Fungsi Palsu | Realita |
| --- | --- |
| `clip.isOffline()` | ❌ Tidak ada. Gunakan `clip.projectItem.isOffline()` |
| `clip.isSelected()` | ❌ Tidak ada di ExtendScript API standar |
| `track.clips.length` | ❌ Gunakan `track.clips.numItems` |
| `seq.videoTracks.length` | ❌ Gunakan `seq.videoTracks.numTracks` |
| `seq.removeGaps()` | ❌ Tidak ada. Hapus klip manual lalu ripple |
| `clip.delete()` | ❌ Gunakan `clip.remove(1, 1)` |
| `clip.name` (set) | ❌ TrackItem.name = READ ONLY. Ubah via `clip.projectItem.name` |
| `track.clips.push()` | ❌ Gunakan `track.insertClip()` atau `track.overwriteClip()` |
| `clip.selected` | ❌ Tidak ada cara cek seleksi klip timeline via ExtendScript |
| `clip.addEffect()` | ❌ Tidak ada di standard API. Gunakan QE DOM: `qeItem.addVideoEffect()` |
| `clip.removeEffect()` | ❌ Tidak ada di standard API |
| `let` / `const` | ❌ ExtendScript = ES3. Gunakan `var` saja |
| `Array.forEach()` | ❌ Tidak ada di ES3. Gunakan `for` loop biasa |
| `Array.map()` / `filter()` / `reduce()` | ❌ Tidak ada di ES3 |
| `template literals` (\`\`) | ❌ Gunakan string concat dengan `+` |
| `arrow functions` (`=>`) | ❌ Gunakan `function(){}` biasa |
| `JSON.parse()` / `JSON.stringify()` | ⚠️ Mungkin tidak tersedia. Jika perlu, bangun string manual |
| `for...of` / `for...in` (on Collections) | ❌ Gunakan `for (var i = 0; i < col.numItems; i++)` |
| `Object.keys()` | ❌ Tidak ada di ES3 |
| `String.includes()` / `startsWith()` / `endsWith()` | ❌ Gunakan `indexOf() !== -1` |
| `Promise` / `async` / `await` | ❌ ExtendScript = synchronous only |

---

## 📏 14. ATURAN PENULISAN KODE

1. **Selalu gunakan `var`** — bukan `let` atau `const`.
2. **Selalu iterasi mundur** jika ada operasi hapus (`j = numItems - 1; j >= 0; j--`).
3. **Selalu cek `app.project.activeSequence`** sebelum melakukan apa pun.
4. **Selalu return string** yang mendeskripsikan hasil operasi (jumlah item diproses).
5. **Jangan pakai `.length`** pada Collection Adobe — pakai `.numItems` atau `.numTracks`.
6. **Selalu scan KEDUA jenis track** (video + audio) kecuali user secara eksplisit minta satu jenis saja.
7. **Akses properti Time** dengan `parseFloat(timeObj.seconds)` atau `timeObj.ticks` (string).
8. **Untuk `remove()` gunakan `clip.remove(1, 1)`** — arg pertama = ripple (tutup gap), arg kedua = align to edit.
9. **Jangan pernah call fungsi yang tidak ada di daftar API di atas** — lebih baik return error daripada halusinasi.
10. **Untuk MENAMBAHKAN efek/transisi baru**, WAJIB pakai QE DOM (`app.enableQE()` → `qe.project.getVideoEffectByName()` → `qeItem.addVideoEffect()`). Standard API hanya bisa MEMBACA dan MENGUBAH efek yang sudah ada.
11. **Semua operasi QE harus di-try/catch** karena QE DOM undocumented dan bisa gagal diam-diam.
12. **Index komponen video:** `[0]=Motion`, `[1]=Opacity`, `[2]=Time Remapping`, `[3+]=User effects`.
13. **Index komponen audio:** `[0]=Volume`, `[1]=Panner`, `[2+]=User effects`.
14. **Untuk string comparison** gunakan `===` bukan `==`.
15. **Untuk angka dari Time object** selalu pakai `parseFloat()` karena `.seconds` bisa return string.

---
**Works cited**
1. Time object - Premiere Pro Scripting Guide
2. Premiere API—UXP for Adobe Premiere
3. Offline Docs - Premiere Pro Scripting Guide - docsforadobe.dev
4. Encoder object - Premiere Pro Scripting Guide
5. Metadata object - Premiere Pro Scripting Guide
6. Application object - Premiere Pro Scripting Guide
7. Project object - Premiere Pro Scripting Guide
8. Track object - Premiere Pro Scripting Guide
9. Sequence object - Premiere Pro Scripting Guide
10. TrackItem object - Premiere Pro Scripting Guide
11. Component object - Premiere Pro Scripting Guide
12. Marker object - Premiere Pro Scripting Guide
13. Premiere and UXP - Adobe Developer
14. CaptionTrack - Adobe Developer
15. Objects - Adobe Developer
16. Transcript - Adobe Developer
17. AudioTrack - Adobe Developer
