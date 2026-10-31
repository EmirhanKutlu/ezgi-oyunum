kaboom({
    width: 800,
    height: 600,
    background: [128, 0, 0],
    touchToMouse: true
});

// ======================================
// GÖRSELLER
// ======================================

loadSprite("ezgi", "ezgi.png");
loadSprite("emirhan_temiz", "emirhan_temiz.png");
loadSprite("emirhan_dagilmis", "emirhan_dagilmis.png");
loadSprite("manzara", "manzara.png");
loadSprite("ezgi_yasli", "ezgi_yasli.png");
loadSprite("emirhan_yasli", "emirhan_yasli.png");

let dayakYedi = false;

// ======================================
// DÜŞMAN BÖLGELERİ
// ======================================

function dusmanlariOlustur() {

    const bolgeler = [];
    const konumlar = [700, 1450, 2200, 3000, 3800];

    konumlar.forEach(merkez => {

        // KÜÇÜLTÜLMÜŞ ENGELLER
        const solEngel = add([
            rect(21, 90),
            pos(merkez - 150, 410),
            anchor("center"),
            area(),
            body({ isStatic: true }),
            color(75, 65, 55),
            "engel"
        ]);

        const sagEngel = add([
            rect(21, 90),
            pos(merkez + 150, 410),
            anchor("center"),
            area(),
            body({ isStatic: true }),
            color(75, 65, 55),
            "engel"
        ]);

        // KÜÇÜK İNSAN GÖRÜNÜMLÜ DÜŞMAN
        const dusman = add([
            rect(24, 32),
            pos(merkez, 455),
            anchor("center"),
            area(),
            color(45, 80, 165),
            "dusman"
        ]);

        // Kafa
        dusman.add([
            rect(19, 18),
            pos(0, -25),
            anchor("center"),
            color(230, 180, 135)
        ]);

        // Saç
        dusman.add([
            rect(21, 7),
            pos(0, -34),
            anchor("center"),
            color(45, 25, 15)
        ]);

        // Gözler
        dusman.add([
            rect(3, 3),
            pos(-5, -25),
            anchor("center"),
            color(0, 0, 0)
        ]);

        dusman.add([
            rect(3, 3),
            pos(5, -25),
            anchor("center"),
            color(0, 0, 0)
        ]);

        // Kollar
        dusman.add([
            rect(7, 22),
            pos(-15, -1),
            anchor("center"),
            color(230, 180, 135)
        ]);

        dusman.add([
            rect(7, 22),
            pos(15, -1),
            anchor("center"),
            color(230, 180, 135)
        ]);

        // Bacaklar
        dusman.add([
            rect(8, 16),
            pos(-7, 23),
            anchor("center"),
            color(30, 30, 45)
        ]);

        dusman.add([
            rect(8, 16),
            pos(7, 23),
            anchor("center"),
            color(30, 30, 45)
        ]);

        // SEKİZ ŞEKLİNDE DEVRİYE HAREKETİ
        const baslangicZamani = time();

        dusman.onUpdate(() => {

            if (!bolgeler.some(b => b.dusman === dusman && b.canli)) {
                return;
            }

            const t = (time() - baslangicZamani) * 1.8;

            dusman.pos.x = merkez + Math.sin(t) * 90;
            dusman.pos.y = 455 + Math.sin(t * 2) * 8;
        });

        bolgeler.push({
            dusman: dusman,
            solEngel: solEngel,
            sagEngel: sagEngel,
            canli: true
        });
    });

    return bolgeler;
}

// ======================================
// TOKAT MEKANİĞİ
// ======================================

function tokatAt(player, bolgeler) {

    let hedef = null;
    let enYakinMesafe = 230;

    bolgeler.forEach(bolge => {

        if (!bolge.canli) return;

        const dusman = bolge.dusman;

        const mesafe = Math.abs(
            dusman.pos.x - player.pos.x
        );

        const yukseklik = Math.abs(
            dusman.pos.y - player.pos.y
        );

        // YÖN ŞARTI YOK: YAKINDAKİ DÜŞMANI BUL
        if (
            mesafe < enYakinMesafe &&
            yukseklik < 190
        ) {
            hedef = bolge;
            enYakinMesafe = mesafe;
        }
    });

    if (!hedef) {

        add([
            text("ISKA!", { size: 25 }),
            pos(player.pos.x, player.pos.y - 80),
            anchor("center"),
            color(255, 220, 100),
            lifespan(0.4)
        ]);

        return;
    }

    const x = hedef.dusman.pos.x;
    const y = hedef.dusman.pos.y - 65;

    hedef.canli = false;

    hedef.dusman.destroy();
    hedef.solEngel.destroy();
    hedef.sagEngel.destroy();

    add([
        text("PAT!", { size: 40 }),
        pos(x, y),
        anchor("center"),
        color(255, 45, 30),
        lifespan(0.7)
    ]);

    shake(7);
}

// ======================================
// MOBİL KONTROLLER
// ======================================

function mobilKontroller(player, bolgeler) {

    // EKRANA SABİT ALT PANEL
    add([
        rect(800, 115),
        pos(400, 542),
        anchor("center"),
        color(15, 15, 15),
        opacity(0.78),
        fixed(),
        z(90)
    ]);

    function butonOlustur(x, y, etiket, boyut, action) {

        const buton = add([
            rect(76, 76, { radius: 12 }),
            pos(x, y),
            anchor("center"),
            color(65, 65, 65),
            opacity(0.95),
            area(),
            fixed(),
            z(100)
        ]);

        buton.add([
            text(etiket, { size: boyut }),
            anchor("center"),
            color(255, 255, 255)
        ]);

        if (action) {
            buton.onClick(action);
        }

        return buton;
    }

    function zipla() {
        if (player.isGrounded()) {
            player.jump(900);
        }
    }

    function tokat() {
        tokatAt(player, bolgeler);
    }

    butonOlustur(75, 542, "◀", 30, null);
    butonOlustur(165, 542, "▶", 30, null);

    butonOlustur(625, 542, "ZIPLA", 15, zipla);
    butonOlustur(725, 542, "TOKAT", 15, tokat);

    // KLAVYE KONTROLLERİ
    onKeyPress("space", zipla);
    onKeyPress("f", tokat);

    return {

        hareket() {

            const p = mousePos();
            const basili = isMouseDown();

            // SABİT EKRAN KONUMUNA GÖRE TUŞ KONTROLÜ
            const solTik =
                basili &&
                p.x >= 37 &&
                p.x <= 113 &&
                p.y >= 504 &&
                p.y <= 580;

            const sagTik =
                basili &&
                p.x >= 127 &&
                p.x <= 203 &&
                p.y >= 504 &&
                p.y <= 580;

            return {
                sol: isKeyDown("left") || solTik,
                sag: isKeyDown("right") || sagTik
            };
        }
    };
}

// ======================================
// MACERA SAHNESİ
// ======================================

function maceraSahnesiOlustur(ikinciBolum) {

    setGravity(2500);

    add([
        sprite("manzara", {
            width: 800,
            height: 600
        }),
        pos(400, 300),
        anchor("center"),
        fixed(),
        z(-1)
    ]);

    add([
        text(
            ikinciBolum
                ? "Icin sogumadiysa tekrar yanina git!"
                : "Yuru ve Emirhan'a Ulas!",
            { size: 24 }
        ),
        pos(20, 20),
        fixed(),
        z(50)
    ]);

    // YOL
    add([
        rect(5200, 100),
        pos(-100, 500),
        area(),
        body({ isStatic: true }),
        color(34, 139, 34)
    ]);

    // EZGİ - YARI BOYUT
    const player = add([
        sprite("ezgi"),
        pos(50, 350),
        scale(0.7),
        area(),
        body(),
        anchor("center")
    ]);

    // EMİRHAN - YARI BOYUT
    const emirhan = add([
        sprite(
            ikinciBolum
                ? "emirhan_dagilmis"
                : "emirhan_temiz"
        ),
        pos(4600, 410),
        scale(0.7),
        area(),
        body({ isStatic: true }),
        anchor("center"),
        "emirhan_tag"
    ]);

    emirhan.flipX = true;

    // DÜŞMANLAR
    const bolgeler = dusmanlariOlustur();

    // KONTROLLER
    const kontroller = mobilKontroller(player, bolgeler);

    let bittiMi = false;

    // EMİRHAN'A ULAŞMA
    player.onCollide("emirhan_tag", () => {

        if (bittiMi) return;

        bittiMi = true;

        add([
            text("<3", { size: 60 }),
            pos(emirhan.pos.x, emirhan.pos.y - 100),
            anchor("center"),
            color(255, 100, 150),
            lifespan(1)
        ]);

        wait(1, () => {
            go(ikinciBolum ? "secim_2" : "secim_1");
        });
    });

    // HAREKET
    onUpdate(() => {

        const hareket = kontroller.hareket();

        let yuru = false;

        if (hareket.sol) {

            player.move(-450, 0);
            player.flipX = true;
            yuru = true;

        } else if (hareket.sag) {

            player.move(450, 0);
            player.flipX = false;
            yuru = true;
        }

        if (yuru && player.isGrounded()) {
            player.angle = wave(-12, 12, time() * 15);
        } else {
            player.angle = 0;
        }

        // KAMERA KARAKTERİ TAKİP EDER
        camPos(player.pos.x + 150, 300);

        if (player.pos.x < 0) {
            player.pos.x = 0;
        }
    });
}

// ======================================
// GİRİŞ
// ======================================

scene("giris", () => {

    add([
        text("Ezgi'nin Macerasi\n\nEmirhan'a Ulas!", {
            size: 36,
            align: "center"
        }),
        pos(400, 280),
        anchor("center"),
        color(255, 255, 255)
    ]);

    add([
        text("Baslamak icin TIKLA veya BOSLUK", {
            size: 20
        }),
        pos(400, 520),
        anchor("center"),
        color(200, 200, 200)
    ]);

    onKeyPress("space", () => go("macera_1"));
    onClick(() => go("macera_1"));
});

// ======================================
// MACERA 1
// ======================================

scene("macera_1", () => {
    maceraSahnesiOlustur(false);
});

// ======================================
// SEÇİM 1
// ======================================

scene("secim_1", () => {

    camPos(400, 300);

    add([
        sprite("manzara", { width: 800, height: 600 }),
        pos(400, 300),
        anchor("center"),
        fixed(),
        z(-1)
    ]);

    add([
        sprite("ezgi"),
        pos(200, 250),
        scale(0.8),
        anchor("center")
    ]);

    const e = add([
        sprite("emirhan_temiz"),
        pos(600, 250),
        scale(0.8),
        anchor("center")
    ]);

    e.flipX = true;

    add([
        rect(500, 60, { radius: 10 }),
        pos(400, 150),
        anchor("center"),
        color(0, 0, 0),
        opacity(0.6)
    ]);

    add([
        text("Cok ozur dilerim...", { size: 32 }),
        pos(400, 150),
        anchor("center"),
        color(255, 255, 255)
    ]);

    function btn(txt, p, action) {

        const b = add([
            rect(200, 60, { radius: 8 }),
            pos(p),
            area(),
            anchor("center"),
            color(255, 255, 255)
        ]);

        b.add([
            text(txt, { size: 24 }),
            anchor("center"),
            color(0, 0, 0)
        ]);

        b.onClick(action);
        b.onHover(() => b.color = rgb(220, 220, 220));
        b.onHoverEnd(() => b.color = rgb(255, 255, 255));
    }

    btn("Affet", vec2(250, 500), () => go("gecis_40_yil"));
    btn("Patakla", vec2(550, 500), () => go("surundur"));
});

// ======================================
// SÜRÜNDÜR
// ======================================

scene("surundur", () => {

    camPos(400, 300);

    add([
        sprite("manzara", { width: 800, height: 600 }),
        pos(400, 300),
        anchor("center"),
        fixed(),
        z(-1)
    ]);

    const dEzgi = add([
        sprite("ezgi"),
        pos(300, 350),
        scale(0.8),
        anchor("center")
    ]);

    const dEmirhan = add([
        sprite("emirhan_temiz"),
        pos(500, 350),
        scale(0.8),
        anchor("center")
    ]);

    dEmirhan.flipX = true;

    const loopAnim = loop(0.2, () => {

        dEzgi.pos.x = 300 + rand(-15, 15);
        dEmirhan.pos.x = 500 + rand(-20, 20);

        add([
            text(choose(["PAT!", "KUT!", "CAT!"]), {
                size: rand(50, 80)
            }),
            pos(rand(300, 500), rand(200, 400)),
            anchor("center"),
            color(255, 0, 0),
            lifespan(0.3)
        ]);

        shake(15);
    });

    wait(1.5, () => {
        dEmirhan.use(sprite("emirhan_dagilmis"));
    });

    wait(3, () => {

        loopAnim.cancel();

        dayakYedi = true;

        go("macera_2");
    });
});

// ======================================
// MACERA 2
// ======================================

scene("macera_2", () => {
    maceraSahnesiOlustur(true);
});

// ======================================
// SEÇİM 2
// ======================================

scene("secim_2", () => {

    camPos(400, 300);

    add([
        sprite("manzara", { width: 800, height: 600 }),
        pos(400, 300),
        anchor("center"),
        fixed(),
        z(-1)
    ]);

    add([
        sprite("ezgi"),
        pos(200, 250),
        scale(0.8),
        anchor("center")
    ]);

    const e = add([
        sprite("emirhan_dagilmis"),
        pos(600, 250),
        scale(0.8),
        anchor("center")
    ]);

    e.flipX = true;

    add([
        rect(500, 60, { radius: 10 }),
        pos(400, 150),
        anchor("center"),
        color(0, 0, 0),
        opacity(0.6)
    ]);

    add([
        text("Lutfen artik affet...", { size: 32 }),
        pos(400, 150),
        anchor("center"),
        color(255, 255, 255)
    ]);

    function btn(txt, p, action) {

        const b = add([
            rect(250, 60, { radius: 8 }),
            pos(p),
            area(),
            anchor("center"),
            color(255, 255, 255)
        ]);

        b.add([
            text(txt, { size: 22 }),
            anchor("center"),
            color(0, 0, 0)
        ]);

        b.onClick(action);
        b.onHover(() => b.color = rgb(220, 220, 220));
        b.onHoverEnd(() => b.color = rgb(255, 255, 255));
    }

    btn("Tamam, Affettim", vec2(200, 500), () => go("gecis_40_yil"));
    btn("Beter Ol (Tekrar Dov)", vec2(600, 500), () => go("surundur"));
});

// ======================================
// 40 YIL SONRA
// ======================================

scene("gecis_40_yil", () => {

    camPos(400, 300);

    add([
        rect(800, 600),
        pos(0, 0),
        color(0, 0, 0)
    ]);

    add([
        text("40 Yil Sonra...", { size: 50 }),
        pos(400, 280),
        anchor("center"),
        color(255, 255, 255)
    ]);

    add([
        text("(Devam etmek icin tiklayiniz)", { size: 20 }),
        pos(400, 340),
        anchor("center"),
        color(150, 150, 150)
    ]);

    onClick(() => go("mutlu_son"));
    onKeyPress("space", () => go("mutlu_son"));
});

// ======================================
// MUTLU SON
// ======================================

scene("mutlu_son", () => {

    camPos(400, 300);

    add([
        sprite("manzara", { width: 800, height: 600 }),
        pos(400, 300),
        anchor("center"),
        fixed(),
        z(-1)
    ]);

    // GÜNEŞ
    add([
        circle(40),
        pos(150, 120),
        color(255, 220, 100),
        opacity(0.9)
    ]);

    // EV - TASARIMI KORUNDU
    add([
        rect(140, 100),
        pos(650, 400),
        anchor("center"),
        color(80, 30, 20)
    ]);

    add([
        rect(160, 20),
        pos(650, 340),
        anchor("center"),
        color(60, 20, 15)
    ]);

    add([
        rect(120, 15),
        pos(650, 325),
        anchor("center"),
        color(60, 20, 15)
    ]);

    add([
        rect(80, 15),
        pos(650, 310),
        anchor("center"),
        color(60, 20, 15)
    ]);

    add([
        rect(40, 15),
        pos(650, 295),
        anchor("center"),
        color(60, 20, 15)
    ]);

    add([
        rect(25, 35),
        pos(650, 395),
        anchor("center"),
        color(255, 180, 50)
    ]);

    // YAŞLI EZGİ - BOYUTU KORUNDU
    add([
        sprite("ezgi_yasli", { width: 200 }),
        pos(245, 400),
        anchor("center")
    ]);

    // YAŞLI EMİRHAN - BOYUTU KORUNDU
    const yasliEmirhan = add([
        sprite("emirhan_yasli", { width: 200 }),
        pos(465, 400),
        anchor("center")
    ]);

    yasliEmirhan.flipX = true;

    // ROMANTİK MESAJ
    add([
        rect(750, 110, { radius: 10 }),
        pos(400, 510),
        anchor("center"),
        color(0, 0, 0),
        opacity(0.7)
    ]);

    add([
        text(
            "Yaptigim salaklik icin binlerce kez ozur diliyorum,\nseni cok seviyorum.\n\nUmarim bu oyunun sonundaki gibi birlikte yaslaniriz Ezgim.",
            {
                size: 20,
                align: "center",
                width: 700
            }
        ),
        pos(400, 510),
        anchor("center"),
        color(255, 255, 255)
    ]);
});

// ======================================
// OYUNU BAŞLAT
// ======================================

go("giris");