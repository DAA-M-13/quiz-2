# FrostBound Bots

FrostBound Bots adalah game puzzle satu pemain di papan es 16 × 16. Tujuannya membawa robot yang ditentukan ke petak target dengan jumlah langkah sesedikit mungkin. Ada empat robot yang dapat digerakkan, yaitu Ruby (merah), Mint (hijau), Volt (kuning), dan Byte (biru). Robot lain bisa diposisikan sebagai penghalang agar robot target berhenti di petak yang tepat.

## Menjalankan proyek

```sh
npm ci
npm run dev
```

Buka URL lokal yang dicetak Vite di terminal. Gunakan `npm run build` untuk membuat build produksi dan `npm run preview` untuk membukanya secara lokal.

## Cara bermain

Pilih robot dengan klik, sentuhan, atau tombol **1–4**, lalu gerakkan dengan tombol panah atau kontrol di layar. Robot meluncur lurus sampai terhalang dinding, tepi papan, petak es yang tertutup, atau robot lain. Satu luncuran yang mengubah posisi dihitung sebagai satu langkah. Ronde selesai saat robot target **berhenti** di petak target.

| Kontrol | Fungsi |
| --- | --- |
| **Hint** | Menampilkan robot dan arah untuk langkah pertama pada salah satu solusi terpendek dari posisi sekarang. |
| **Solve** | Menjalankan BFS, IDDFS, atau A*, lalu menampilkan eksplorasi dan memutar ulang solusi jika ditemukan. |
| **Undo** | Membatalkan satu langkah terakhir. |
| **Restart Round (R)** | Mengembalikan posisi robot ke awal ronde dan mengosongkan riwayat langkah. |
| **Next Round** | Memulai ronde berikutnya di papan yang sama dari posisi akhir keempat robot, dengan target baru. |
| **New Game** | Membuat chapter dengan papan dan posisi awal baru. |

**Your Moves** menghitung langkah pemain pada ronde berjalan. **Minimum Moves** menunjukkan panjang solusi terpendek dari posisi awal ronde. Memuat ulang halaman mengembalikan ronde pertama chapter yang tersimpan di browser.

## Pemodelan ruang pencarian

Satu keadaan menyimpan posisi **keempat** robot dalam urutan tetap `[Ruby, Mint, Volt, Byte]`. Posisi robot pendamping ikut menentukan petak tempat robot target dapat berhenti. Dua keadaan dengan posisi robot target yang sama bisa menghasilkan pilihan langkah yang berbeda.

Papan dan tujuan tetap selama satu pencarian. Dari setiap keadaan, solver mencoba hingga 16 aksi, yaitu empat robot dikalikan empat arah. Setiap aksi memakai fungsi [slide](src/core/movement.js) yang juga digunakan dalam permainan. Fungsi ini menyimpan tabel tetangga papan untuk dinding dan petak tertutup, kemudian memeriksa posisi robot saat menyusuri petak satu per satu. Aksi yang membuat robot diam dilewati. Setiap luncuran yang berhasil membentuk sisi berbiaya satu pada graf keadaan, sehingga solusi terpendek berarti jumlah luncuran minimum.

Petak pada papan 16 × 16 dapat direpresentasikan dengan indeks 0–255. Solver menggabungkan empat indeks tersebut sebagai digit basis 256 untuk membuat kunci numerik yang unik bagi setiap susunan robot. Sebuah keadaan memenuhi tujuan ketika indeks posisi robot target sama dengan indeks petak tujuan.

### Breadth-First Search (BFS)

[BFS](src/algorithms/bfs.js) menggunakan antrean FIFO untuk memproses keadaan berdasarkan jumlah langkah. Ia memproses keadaan awal, kemudian keadaan yang dicapai dalam satu langkah, dua langkah, dan seterusnya. Karena biaya semua sisi sama, tujuan pertama yang ditemukan memberikan jumlah langkah minimum.

Setiap keadaan baru ditandai dalam `seen` saat dimasukkan ke antrean. Jika susunan itu muncul lagi melalui rangkaian langkah lain, solver melewatinya. Entri antrean menyimpan indeks induk dan aksi yang digunakan untuk mencapainya. Saat menemukan tujuan, solver menelusuri induk ke belakang lalu membalik urutan aksi. Antrean dan himpunan keadaan yang sudah ditemukan tumbuh seiring luasnya eksplorasi.

### Iterative Deepening Depth-First Search (IDDFS)

[IDDFS](src/algorithms/iddfs.js) menjalankan pencarian mendalam dengan batas yang naik dari 0, 1, 2, dan seterusnya. Pada setiap iterasi, solver menelusuri cabang menggunakan stack. Setelah mencapai batas, ia mundur untuk mencoba pilihan berikutnya. Himpunan `onPath` mencegah siklus pada jalur yang sedang ditelusuri. Ketika tujuan ditemukan, aksi pada stack dan aksi terakhir membentuk solusi.

Batas pertama yang menghasilkan solusi sama dengan panjang solusi terpendek. Stack aktif tumbuh mengikuti kedalaman, sementara implementasi juga menyimpan himpunan keadaan untuk mendeteksi habisnya pencarian dan jejak untuk animasi. Keadaan dangkal dapat dikunjungi berulang kali saat batas bertambah, sehingga anggaran pencarian bisa habis sebelum IDDFS mencapai kedalaman solusi.

### A* Search

[A*](src/algorithms/astar.js) memakai min-heap untuk memilih keadaan dengan nilai `f = g + h` terendah. Nilai `g` adalah jumlah langkah dari posisi awal dan `h` adalah estimasi sisa langkah. Jika nilai `f` sama, heap mendahulukan nilai `h` yang lebih kecil. Map `bestG` menyimpan biaya terkecil yang sudah ditemukan untuk setiap keadaan.

Heuristik menambah satu jika baris robot target berbeda dari baris petak tujuan dan satu jika kolomnya berbeda. Nilainya 0 saat robot sudah di tujuan, 1 saat hanya satu koordinat berbeda, dan 2 saat keduanya berbeda. Satu luncuran hanya mengubah baris atau kolom, sehingga estimasi ini merupakan batas bawah biaya aktual. Dinding dan posisi robot lain tetap diperiksa saat membangkitkan langkah. Heuristik hanya menentukan prioritas antrean dan tidak menghitung langkah tambahan untuk menata robot pendamping.

## Pemakaian algoritma dalam permainan

- **Pembuatan ronde.** Generator membuat dinding berbentuk L di sektor-sektor papan dan menempatkan robot pada empat petak berbeda di luar area tengah yang tertutup. BFS menjelajahi keadaan dari posisi awal untuk mengumpulkan pasangan robot dan petak tujuan yang bisa dicapai. Kedalaman saat pasangan pertama kali ditemukan menjadi nilai **Minimum Moves**. Permainan memilih target secara acak dari kandidat yang ditemukan.
- **Petunjuk.** BFS mencari solusi dari susunan robot saat tombol **Hint** ditekan. Langkah pertama bisa menggerakkan robot pendamping untuk menyiapkan titik berhenti.
- **Visualisasi.** **Solve** mengambil hingga 100 sampel dari jejak eksplorasi untuk ditampilkan pada **Search Exploration**. Jika solusi ditemukan, **Solution Playback** memutar urutan luncuran yang membawa robot ke tujuan.

Satu pemanggilan pencarian untuk pembuatan ronde menggunakan anggaran 900 ekspansi atau 100 ms. Pencarian untuk **Hint** dan **Solve** menggunakan anggaran 20.000 ekspansi atau 750 ms. Pekerjaan dibagi menjadi potongan waktu singkat agar browser dapat merespons kontrol. Status `limited` berarti batas tercapai dengan eksplorasi tersisa. Status `exhausted` berarti pencarian telah menghabiskan ruang yang bisa dijelajahi dari posisi awal.

### Contoh solusi dua langkah

Pada [papan uji 8 × 8](tests/fixtures/exampleBoard.js), Ruby mulai di indeks 8 dan targetnya di indeks 11. Mint berada di indeks 4.

1. Gerakkan **Mint ke bawah**. Dinding di antara indeks 12 dan 20 membuat Mint berhenti di indeks 12.
2. Gerakkan **Ruby ke kanan**. Mint menghalangi indeks 12, sehingga Ruby berhenti tepat di indeks 11.

Contoh yang sama tersedia di [prototipe](prototype/index.html).

## Pengujian

- `npm test` menjalankan pengujian aturan luncuran, BFS, IDDFS, dan pengambilan sampel jejak.
- `npm run test:browser` menjalankan Playwright dengan Chrome lokal, termasuk pengujian kontrol sentuh, pemulihan chapter, dan pemutaran solusi.
- Folder [evaluation](evaluation/) berisi tangkapan layar dan hasil pengukuran pencarian pada papan uji dengan seed tetap.
