# Product Requirements Document · Robot Seluncur

**Versi 1.5 · Quiz 2 EF234405 Design & Analysis of Algorithms**

## 1. Ringkasan produk

**Robot Seluncur** adalah game puzzle web untuk satu pemain. Pemain langsung bermain di mode Main Bebas dan dapat membuka popup How to Play kapan saja untuk memahami aturan. Pemain mengendalikan empat robot di papan berdinding. Setiap robot meluncur lurus sampai terhalang. Pemain menang saat robot yang ditentukan oleh puzzle berhenti tepat di dok. Tiga robot lainnya bisa digeser untuk menciptakan titik berhenti yang dibutuhkan.

Satu chapter menggunakan papan dan posisi awal empat robot yang tetap. Setiap ronde memilih satu robot target dan satu dok. Pemain bisa mencoba tanpa batas gerakan. BFS menghitung minimum dari awal ronde, memberi Hint dari posisi saat ini, dan menyediakan Solve untuk memutar solusi terpendek dengan animasi.

**Pengguna utama** adalah pemain baru yang ingin langsung mencoba puzzle serta dosen dan mahasiswa yang mengevaluasi penerapan BFS dalam Quiz 2. Build awal menggunakan HTML, CSS, dan JavaScript serta berjalan di browser.

## 2. Cakupan versi kuis

| Prioritas | Cakupan |
|---|---|
| Wajib | Main Bebas 16 × 16, empat robot, chapter dengan layout acak, ronde beruntun, kontrol keyboard dan layar, hitungan gerakan, minimum BFS per ronde, Hint, Solve animasi, popup How to Play, New Game, dan popup kemenangan. |
| Wajib | Chapter dan ronde acak yang divalidasi BFS agar selalu solvable. Game langsung membuka Main Bebas tanpa menu atau level tutorial terpisah. |
| Pengembangan lanjutan | Chapter tambahan, papan lebih besar, penyimpanan progres antarsesi, dan statistik kumulatif. |

Versi kuis mengadaptasi alur yang terlihat pada referensi Ricocheto, yaitu papan dengan empat robot, target ronde, How to Play, New Game, popup hasil, dan Next Round. Robot Seluncur menambahkan minimum gerakan dari BFS, Hint arah, dan Solve beranimasi. Tampilan dan kode dibuat sendiri oleh tim.

## 3. Aturan permainan

1. **Chapter** menetapkan ukuran papan, dinding, posisi awal empat robot, dan target ronde pertama. Layout dan posisi awal dibuat acak saat **New Game**, lalu tetap selama chapter berlangsung.
2. Setiap **ronde** memilih satu dari empat robot sebagai target dan satu koordinat dok. Ronde berikutnya memilih secara acak satu pasangan (robot target, dok) yang terbukti dapat dicapai dari posisi akhir ronde sebelumnya. Robot atau dok boleh terulang sendiri, tetapi pasangan yang sama tidak boleh terulang berturut-turut.
3. Pemain memilih satu robot dan memberi perintah arah. Robot meluncur lurus sampai tertahan dinding, batas papan, atau robot lain. Robot lain dapat dipindahkan untuk menjadi penghalang.
4. Setiap perintah yang memindahkan robot dihitung satu gerakan. Gerakan keempat robot dihitung. Perintah yang langsung terhalang tidak menambah hitungan.
5. Ronde menang ketika robot target berhenti tepat di dok. Melewati dok saat meluncur tidak dianggap menang.
6. Saat pemain menang, popup hasil menampilkan jumlah gerakan dan minimum ronde. Saat pemain memilih **Next Round**, layout dinding dan posisi empat robot dipertahankan persis seperti kondisi akhir ronde. Hanya target robot dan posisi dok yang diacak. Hitungan ronde dimulai dari nol.
7. **New Game** membuat chapter baru dengan layout dinding dan posisi awal robot acak, mereset ronde serta hitungan, dan memilih target baru.
8. **Refresh** memuat kembali konfigurasi chapter aktif, lalu mengembalikan robot dan permainan ke keadaan awal chapter. Ronde yang sedang berjalan kembali ke ronde pertama.
9. **Undo** membatalkan satu perintah gerak dan memulihkan posisi robot serta hitungan sebelum perintah itu.

## 4. Alur bermain

| Mode atau layar | Perilaku |
|---|---|
| **Main Bebas / Chapter** | Game langsung membuka papan 16 × 16. Tombol **New Game** membuat chapter dengan susunan dinding dan posisi awal robot yang diacak. Setiap ronde memiliki robot target dan dok acak yang sudah diperiksa solvabilitasnya. **Next Round** mempertahankan layout dan posisi akhir keempat robot, lalu memilih target dan dok baru. |
| **How to Play** | Tombol membuka popup berisi aturan gerak, cara memilih dan menggerakkan robot, tujuan ronde, fungsi robot sebagai penghalang, serta penjelasan Hint, Solve, Undo, dan Ulangi Ronde. Popup dapat ditutup tanpa mengubah state permainan. |
| **Popup menang** | Tampilkan jumlah gerakan pada ronde selesai, minimum BFS ronde tersebut, serta tombol **Next Round** dan **New Game**. |

## 5. Antarmuka dan kebutuhan fungsional

| ID | Kebutuhan | Perilaku yang dapat diamati |
|---|---|---|
| F-01 | Papan dan identitas | Tampilkan papan, dinding, empat robot, dok, robot target, dan robot aktif. Gunakan warna serta label atau simbol agar robot tetap bisa dibedakan. |
| F-02 | Memilih robot | Pemain dapat mengeklik atau mengetuk robot, memilihnya dari daftar robot, atau menekan tombol angka **1–4**. Pemilihan membuat penanda robot aktif berpindah tanpa menambah gerakan. |
| F-03 | Memberi arah | Tombol panah keyboard dan tombol arah di layar menjalankan aturan gerak yang sama. Satu input yang valid menghasilkan satu perintah. |
| F-04 | Gerakan aktual | **Gerakanmu** dimulai dari nol pada setiap ronde dan bertambah satu pada gerakan yang sukses. Undo mengurangi hitungan satu. |
| F-05 | Minimum ronde | Tampilkan minimum gerakan BFS saat ronde dimulai. Hitung dari posisi keempat robot pada awal ronde menuju target ronde. Nilai tetap selama ronde berjalan. Next Round menghitung nilai baru dari posisi robot terakhir. |
| F-06 | Hint | BFS dari posisi saat ini menampilkan robot dan arah untuk langkah pertama solusi terpendek. Hint tidak menggerakkan robot. |
| F-07 | Undo | Satu Undo memulihkan posisi robot dan hitungan sebelum gerakan terakhir. Riwayat gerakan ronde baru dimulai kosong. |
| F-08 | Kemenangan dan Next Round | Popup menampilkan jumlah gerakan aktual dan minimum ronde. Next Round mempertahankan layout serta posisi akhir robot, lalu mengacak target dan dok yang solvable. |
| F-09 | New Game dan refresh | New Game menghasilkan chapter acak baru. Refresh mengembalikan chapter aktif ke konfigurasi awal chapter yang sama. |
| F-10 | Solve | BFS mencari solusi terpendek dari posisi terkini. Solve memutar perintah satu per satu dengan animasi dan memperbarui hitungan gerakan. |
| F-11 | How to Play | Tombol membuka popup aturan gerak, kontrol, target/dok, fungsi robot sebagai penghalang, serta fungsi Minimum, Hint, Solve, Undo, Ulangi Ronde, New Game, dan Next Round. Menutup popup tidak mengubah state. |
| F-12 | Validasi ronde acak | Pilih pasangan robot–dok dari hasil eksplorasi BFS terbatas pada awal ronde. Minimum setiap kandidat sedikitnya satu gerakan. Tampilkan ronde hanya setelah kandidat tersedia. |
| F-13 | Ulangi Ronde | Mengembalikan robot ke posisi awal ronde yang sama, mempertahankan layout, target, dok, dan minimum ronde, lalu menolkan hitungan dan mengosongkan riwayat Undo. |

Contoh untuk ronde dengan minimum lima gerakan. Saat ronde dimulai, tampilkan **Gerakanmu 0 · Minimum ronde 5**. Setelah menang dalam delapan gerakan, popup menampilkan **Kamu menyelesaikan ronde dalam 8 gerakan · Minimum 5**.

## 6. Rancangan algoritma

| Unsur graf | Representasi |
|---|---|
| Chapter dan ronde | Chapter menyimpan ukuran papan dan dinding tetap. Ronde menyimpan robot target dan koordinat dok. State ronde mencakup empat posisi robot saat ini. |
| State | Empat koordinat robot dalam urutan identitas yang konsisten. Target dan dok menjadi parameter goal ronde. Robot aktif hanya memengaruhi kontrol antarmuka. |
| Transisi | Simulasikan satu arah untuk satu robot hingga posisi berhenti. Abaikan arah yang tidak mengubah posisi. Ada paling banyak 16 kandidat per state. |
| Biaya | Setiap transisi valid bernilai satu gerakan. |
| Goal state | Koordinat robot target sama dengan koordinat dok setelah gerakan selesai. Posisi robot lain bebas. |

BFS menaruh state awal pencarian di antrean FIFO, mencatat state yang telah ditemukan, dan menyimpan state sebelumnya beserta perintah geraknya. BFS mengeksplorasi state berdasarkan jumlah gerakan. Goal pertama yang ditemukan memberi jumlah gerakan minimum, dan riwayat pendahulunya memberi urutan perintah.

### Membuat ronde dan menghitung minimum

1. Mulai satu BFS dari snapshot awal ronde. Pada New Game, gunakan empat posisi awal yang berbeda pada layout baru. Pada Next Round, gunakan posisi akhir ronde yang baru selesai.
2. Saat BFS pertama kali menemukan robot berhenti di suatu petak setelah gerakan, catat pasangan (robot, petak) dan kedalamannya. Abaikan petak awal robot tersebut dan pasangan ronde sebelumnya. Simpan satu entri per pasangan. Karena BFS memproses kedalaman secara berurutan, kedalaman pertama adalah minimum yang tepat untuk pasangan itu.
3. Batasi jumlah state dan waktu eksplorasi melalui konfigurasi. Saat batas tercapai atau antrean habis, pilih acak dari kandidat yang telah tercatat. Gunakan kedalaman kandidat sebagai **Minimum ronde** sepanjang ronde. Batas eksplorasi memengaruhi variasi kandidat, bukan ketepatan minimum yang sudah ditemukan.
4. Jika belum ada kandidat, pertahankan snapshot dan tampilkan **Coba lagi** atau **New Game**. Coba lagi melanjutkan pencarian yang terhenti karena batas. Jika antrean sudah habis tanpa kandidat, tawarkan New Game. Next Round tidak boleh diam-diam mengganti layout atau posisi robot.

### Hint dan Solve selama permainan

Gunakan BFS dari posisi terkini dengan urutan tetangga tetap: robot 1–4, masing-masing mencoba atas, kanan, bawah, lalu kiri. Hint menampilkan langkah pertama. Solve memutar jalur yang sama satu gerakan per animasi. Setiap langkah selesai menambah satu gerakan dan dicatat dalam riwayat.

| Hasil pencarian | Respons pada layar |
|---|---|
| Goal ditemukan | Hint menampilkan robot dan arah. Solve memulai animasi. |
| Antrean habis tanpa goal | Tampilkan **Tidak ada solusi dari posisi ini**. Pemain dapat memakai Undo jika tersedia atau Ulangi Ronde. |
| Batas waktu atau jumlah state tercapai, masih ada state untuk diperiksa | Tampilkan **Pencarian belum selesai**. Posisi, hitungan, dan minimum ronde tetap. Pemain tetap dapat bermain, memakai Undo, atau mengulang ronde. |

Jalankan pencarian di luar thread UI atau dalam potongan kerja yang memberi browser kesempatan menangani input. Jika posisi, ronde, atau chapter berubah, abaikan hasil pencarian lama. Selama animasi Solve, nonaktifkan input gerak, Undo, Hint, dan Solve. Ulangi Ronde serta New Game membatalkan pencarian dan animasi sebelum menerapkan state baru. Popup kemenangan muncul setelah gerakan terakhir selesai.

**Refresh** memulihkan snapshot awal chapter, termasuk layout, empat posisi awal, pasangan target–dok pertama, dan minimumnya. Riwayat kembali kosong dan hitungan kembali nol.

Jika BFS menjelajahi graf dengan `V` state dan `E` transisi, traversal memerlukan waktu `O(V + E)` dan memori `O(V)`. Saat tetangga dibentuk dengan memindai petak satu per satu, simulasi setiap kandidat memerlukan waktu hingga `O(max(B, K))`, dengan `B` jumlah baris dan `K` jumlah kolom. Dengan paling banyak 16 kandidat per state, batas waktu keseluruhan adalah `O(V × max(B, K))` untuk empat robot. Empat posisi robot dapat menghasilkan banyak kombinasi, sehingga papan Main Bebas divalidasi sebelum tersedia dan waktu respons petunjuk diperiksa pada puzzle tersulit.

## 7. Kriteria penerimaan

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| U-01 | Gerakkan robot ke arah batas, dinding, atau robot lain. | Robot berhenti pada petak legal terakhir. Robot penghalang tidak berpindah. |
| U-02 | Tekan arah yang langsung terhalang. | Seluruh posisi, hitungan gerakan, dan riwayat tetap sama. |
| U-03 | Robot target melintasi dok, lalu robot lain berhenti di dok. | Level tetap berjalan pada kedua kondisi. Kemenangan muncul hanya saat robot target berhenti di dok. |
| U-04 | Selesaikan papan contoh di bagian 8. | BFS mengembalikan minimum dua gerakan. Gerakan robot pendukung dan robot target sama-sama dihitung. |
| U-05 | Buka ronde, gerakkan robot, lalu minta Hint. | Hint dihitung dari posisi terkini. Minimum ronde tetap sama. |
| U-06 | Gunakan Hint lalu Solve dari state yang sama. | Hint cocok dengan langkah pertama Solve. Animasi mencapai target dan hitungan bertambah sesuai panjang solusi. |
| U-07 | Tekan Ulangi Ronde setelah beberapa gerakan. | Robot kembali ke posisi awal ronde yang sama, target, dok, dan minimum tetap. Hitungan nol dan Undo tidak tersedia. |
| U-08 | Gerakkan dua robot lalu Undo. | Papan serta hitungan kembali ke keadaan sebelum gerakan terakhir. |
| U-09 | Menang lalu pilih Next Round. | Layout dinding dan posisi empat robot sama persis dengan state akhir ronde. Pasangan robot–dok berbeda dari ronde sebelumnya, minimum dihitung ulang, hitungan ronde menjadi nol. |
| U-10 | Pilih New Game. | Chapter baru memiliki layout acak, posisi awal baru, target baru, dan hitungan nol. |
| U-11 | Refresh saat chapter berlangsung. | Chapter yang sama dimuat dengan posisi awal chapter, ronde pertama, dan hitungan nol. |
| U-12 | Uji kontrol keyboard serta sentuh. | Papan dan kontrol bisa digunakan. Satu input menghasilkan paling banyak satu gerakan. |
| U-13 | Uji chapter dan ronde acak. | BFS menemukan solusi untuk setiap target sebelum ronde ditampilkan. |
| U-14 | Pada fixture dua gerakan, batasi pencarian Hint sebelum kedalaman dua, lalu ulangi dengan anggaran cukup. | Percobaan pertama memberi status pencarian belum selesai. Percobaan kedua memberi biru ↓. Kedua percobaan menjaga posisi dan hitungan. |
| U-15 | Uji solver dengan robot target terkurung di balik empat dinding dan dok di luar kurungan. Beri anggaran cukup untuk menghabiskan antrean pada papan uji kecil. | Muncul pesan tidak ada solusi. Ulangi Ronde tetap tersedia. |
| U-16 | Saat Solve berjalan, coba input arah dan Undo. Ulangi Ronde atau pilih New Game sebelum animasi selesai. | Input terkunci saat animasi. Setelah reset, langkah lama tidak mengubah posisi, penghitung, atau popup. |
| U-17 | Ubah posisi ketika Hint masih mencari. Uji juga generator dengan anggaran terlalu kecil untuk memperoleh kandidat. | Hint lama tidak tampil pada posisi baru. Generator memberi pilihan pemulihan tanpa membuka ronde kosong atau mengganti posisi akhir pada Next Round. |
| U-18 | Buat beberapa ronde 16 × 16. Putar ulang solusi dari snapshot setiap ronde. | Minimum ≥ 1. Solusi mencapai dok dalam jumlah gerakan yang ditampilkan. Pasangan tidak berulang berturut-turut. |

## 8. Papan contoh untuk evaluasi

Untuk memeriksa simulasi gerak dan BFS, gunakan papan uji **8 × 8** berikut, dengan penomoran baris dari atas dan kolom dari kiri. Papan ini hanya fixture evaluasi algoritma, bukan level yang ditampilkan dalam game. Pasang dinding batas dan satu dinding internal yang memisahkan **(2, 5)** dari **(3, 5)**.

| Elemen | Posisi awal |
|---|---|
| Robot hijau, target | (2, 1) |
| Robot biru | (1, 5) |
| Robot kuning | (8, 1) |
| Robot merah | (8, 8) |
| Dok hijau | (2, 4) |

Hijau yang langsung meluncur ke kanan melewati dok dan berhenti di **(2, 8)**. Solusi optimal dimulai dengan **biru ↓**. Dinding internal menghentikan biru di **(2, 5)**. Setelah itu, **hijau →** berhenti di dok **(2, 4)** karena ada biru di depannya. Target memang belum berada di dok pada keadaan awal dan keempat arah dari posisi awal hijau gagal mencapai goal dalam satu gerakan. Maka **dua gerakan adalah minimum**.

## 9. Struktur Project

Project menggunakan HTML, CSS, dan JavaScript dengan ES Modules. Vite digunakan sebagai server pengembangan dan build tool; project tidak menggunakan framework UI atau backend.

```text
robot-seluncur/
├── index.html
├── package.json
├── src/
│   ├── main.js
│   ├── core/
│   │   ├── movement.js
│   │   ├── gameState.js
│   │   ├── chapterGenerator.js
│   │   └── roundManager.js
│   ├── algorithms/
│   │   └── bfs.js
│   ├── ui/
│   │   ├── renderBoard.js
│   │   ├── controls.js
│   │   └── modals.js
│   ├── input/
│   │   └── keyboard.js
│   ├── styles/
│   │   ├── main.css
│   │   ├── board.css
│   │   └── components.css
│   └── assets/
│       ├── robots/
│       └── ornaments/
└── tests/
    ├── movement.test.js
    └── bfs.test.js
```

| Bagian | Tanggung jawab |
|---|---|
| `core/movement.js` | Menghitung posisi akhir robot berdasarkan arah, dinding, batas papan, dan robot lain. Tidak mengakses DOM. |
| `core/gameState.js` | Menyimpan dan memperbarui state permainan, termasuk posisi robot, hitungan gerakan, riwayat Undo, dan snapshot awal chapter/ronde. |
| `core/chapterGenerator.js` | Membuat layout dinding dan posisi awal robot yang valid, lalu menyerahkannya ke pengelola ronde untuk pemilihan goal pertama. |
| `core/roundManager.js` | Memilih pasangan robot–dok dari kandidat BFS, menyimpan minimum, dan mengatur Next Round, New Game, Ulangi Ronde, dan pemulihan state saat refresh. |
| `algorithms/bfs.js` | Menjalankan BFS tanpa bergantung pada UI. Menyediakan eksplorasi kandidat untuk generator serta pencarian jalur untuk Hint dan Solve. Melaporkan status hasil, jumlah state yang diekspansi, dan durasi. |
| `ui/` dan `input/` | Menggambar state ke halaman, mengelola kontrol tombol/popup, serta meneruskan input keyboard ke logika permainan. |
| `styles/` dan `assets/` | Menyimpan CSS serta ilustrasi robot dan ornamen yang diekspor dari desain. Grid dan penghalang dibuat secara dinamis oleh UI, bukan sebagai gambar papan utuh. |
| `tests/` | Berisi pemeriksaan unit untuk aturan gerak dan BFS agar logika inti dapat diperiksa terpisah dari tampilan. |

`main.js` menginisialisasi chapter dan menghubungkan logika, input, serta render. `package.json` menyediakan perintah pengembangan dan build. Konfigurasi chapter aktif beserta posisi awalnya disimpan di `localStorage` agar refresh dapat mengembalikan state sesuai PRD.

## 10. Evaluasi dan urutan implementasi

**Evaluasi untuk laporan.** Catat ukuran papan, jumlah dinding, state awal ronde, target, minimum gerakan BFS, jumlah state yang diekspansi, dan waktu pencarian. Uji minimum dari awal ronde, Hint dan Solve dari state yang sama, kesinambungan posisi pada Next Round, reset New Game, dan reset chapter saat refresh. Simpan layout dinding dan posisi robot agar pengujian bisa diulang. Pada beberapa papan 16 × 16, ukur durasi pembuatan ronde terpisah dari durasi Hint/Solve. Catat perangkat, browser, batas waktu dan state yang digunakan, status setiap pencarian, serta durasi terlama yang teramati. Tetapkan anggaran bawaan dari hasil pengukuran tersebut.

**Urutan implementasi.**

1. Buat data papan, simulasi gerak, dan pemeriksaan kemenangan. Verifikasi papan uji algoritma.
2. Verifikasi BFS dengan minimum dua gerakan pada fixture. Uji generator, Hint, dan jalur Solve pada papan 16 × 16, termasuk ketika batas pencarian tercapai.
3. Hubungkan papan, kontrol, riwayat, animasi Solve, popup How to Play, dan layar hasil untuk alur Main Bebas.
4. Jalankan kriteria penerimaan dan catat hasil pengujian untuk laporan.

**Keterkaitan dengan Quiz 2.** BFS memenuhi ketentuan menggunakan algoritma yang dipelajari di kelas. Repositori GitHub publik memuat kode dan kontribusi anggota tim. Laporan kuis mendokumentasikan desain, implementasi, evaluasi, dan kesimpulan sesuai instruksi tugas.

### Pengumpulan Quiz 2

- Tenggat pengiriman **26 November 2026 pukul 23.59 WIB**. Ikuti alamat penerima, CC, format subjek email, dan nama ZIP pada lembar soal.
- ZIP berisi dua file: **Report.pdf** dan **Declaration.pdf**. Sertakan ikrar integritas akademik bertanda tangan setiap anggota pada laporan serta pada deklarasi terpisah.
- Cantumkan tautan repositori GitHub publik berisi kode lengkap di badan email. Kontribusi tiap anggota dinilai melalui repositori.
- Bobot penilaian adalah desain 20 poin, implementasi 50, evaluasi 25, dan kesimpulan 5.

## Referensi proyek

- *EF234405 Design & Analysis of Algorithms (M) — Quiz 2*, instruksi tugas.
- *Materi Yang Telah Diajarkan*, Lecture 10 — *Elementary Graph Algorithms: Breadth-First and Depth-First Search*.
