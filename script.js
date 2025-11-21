document.addEventListener('DOMContentLoaded', () => {
    const activityForm = document.getElementById('activity-form');
    const durasiInput = document.getElementById('durasi');
    const jenisOlahragaSelect = document.getElementById('jenis-olahraga');
    const beratBadanInput = document.getElementById('berat-badan');
    const kaloriEstimasiSpan = document.getElementById('kalori-estimasi');
    const weeklyProgress = document.getElementById('weekly-progress');
    const totalTarget = 150; // Target mingguan dalam menit
    let totalDurasiMinggu = 0;

    // --- 1. Kalkulator Kalori Sederhana ---
    // MET (Metabolic Equivalent of Task) untuk berbagai olahraga
    // Nilai METs ini adalah estimasi dan sangat bervariasi
    const MET_VALUES = {
        'lari': 8.0, 
        'bersepeda': 7.5, 
        'pushup': 3.8, 
        'yoga': 2.5
    };
    
    // Formula Kalori Terbakar (Hanya estimasi dasar)
    // Kalori = Durasi (menit) * (METs * Berat Badan (kg) * 3.5) / 200
    // (Berasal dari formula Kalori = Durasi (jam) * METs * Berat (kg))
    function calculateCalories(durasiMenit, jenis, beratKg) {
        const met = MET_VALUES[jenis] || 3.0; // Default 3.0 jika tidak ada
        // Menggunakan formula yang lebih sederhana:
        // Kalori = Durasi (menit) * (MET * Berat Badan) / 60
        // Untuk hasil yang lebih realistis:
        const kalori = (durasiMenit / 60) * met * beratKg; 
        return Math.round(kalori);
    }

    // Event listener untuk menghitung estimasi saat input berubah
    [durasiInput, jenisOlahragaSelect, beratBadanInput].forEach(input => {
        input.addEventListener('input', updateEstimatedCalories);
    });

    function updateEstimatedCalories() {
        const durasi = parseFloat(durasiInput.value) || 0;
        const jenis = jenisOlahragaSelect.value;
        const berat = parseFloat(beratBadanInput.value) || 70;
        
        if (durasi > 0 && berat > 0) {
            const kalori = calculateCalories(durasi, jenis, berat);
            kaloriEstimasiSpan.textContent = kalori.toLocaleString();
        } else {
            kaloriEstimasiSpan.textContent = '0';
        }
    }

    // --- 2. Fungsi Notifikasi ---
    function showNotification(message, type = 'success') {
        const notifArea = document.getElementById('notification-area');
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.textContent = message;

        // Set warna notifikasi berdasarkan tipe (bisa dikembangkan)
        if (type === 'success') {
             notif.style.backgroundColor = '#28a745'; 
        } else if (type === 'warning') {
            notif.style.backgroundColor = '#ffc107'; 
        }

        notifArea.prepend(notif); // Tampilkan di atas

        // Hapus notifikasi setelah 4.5 detik (sesuai CSS fadeout 4s)
        setTimeout(() => {
            notif.remove();
        }, 4500);
    }


    // --- 3. Logika Penyimpanan dan Update UI ---
    activityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const durasi = parseFloat(durasiInput.value);
        const jenis = jenisOlahragaSelect.value;
        const berat = parseFloat(beratBadanInput.value);
        const kalori = calculateCalories(durasi, jenis, berat);

        // ** Simpan data (Simulasi ke Local Storage) **
        const newActivity = {
            jenis,
            durasi,
            kalori,
            tanggal: new Date().toISOString().split('T')[0]
        };
        // Logika untuk menyimpan ke Riwayat (diperlukan Back-end nyata)
        console.log('Aktivitas tersimpan:', newActivity); 

        // Update Dashboard
        totalDurasiMinggu += durasi;
        updateDashboard(durasi, kalori);
        
        // Cek Target (Contoh sederhana)
        checkTargetProgress();

        // Tampilkan Notifikasi Sukses
        showNotification(`✅ ${durasi} Menit ${jenis.toUpperCase()} berhasil dicatat! (${kalori} Kkal)`, 'success');

        // Reset Form
        activityForm.reset();
        kaloriEstimasiSpan.textContent = '0';
    });

    function updateDashboard(newDuration, newCalories) {
        // Hanya update durasi dan kalori hari ini (perlu logika tanggal yang lebih kompleks)
        let currentDuration = parseFloat(document.getElementById('durasi-hari-ini').textContent);
        let currentCalories = parseFloat(document.getElementById('kalori-hari-ini').textContent);

        document.getElementById('durasi-hari-ini').textContent = currentDuration + newDuration;
        document.getElementById('kalori-hari-ini').textContent = currentCalories + newCalories;
    }

    function checkTargetProgress() {
        const percentage = Math.min(100, (totalDurasiMinggu / totalTarget) * 100);
        weeklyProgress.style.width = `${percentage}%`;
        weeklyProgress.textContent = `${Math.round(percentage)}%`;

        if (totalDurasiMinggu >= totalTarget && percentage !== 0) {
            showNotification('🏆 Selamat! Target Mingguan Anda sudah TERCAPAI!', 'success');
        } else if (totalDurasiMinggu > 0 && totalDurasiMinggu < totalTarget && percentage !== 0) {
            showNotification(`🎯 Progress: ${totalDurasiMinggu} Menit tercapai. Terus Semangat!`);
        }
    }

    // Inisialisasi awal
    checkTargetProgress(); 
    updateEstimatedCalories();
});
