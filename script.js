(() => {
    const WA_PHONE = "6282232640474";

    // 1. Navbar scroll state & Mobile Drawer
    const navbar = document.getElementById("navbar");
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");
    const navAnchors = Array.from(document.querySelectorAll(".nav-link"));

    const updateNavbarScroll = () => {
        if (!navbar) return;
        navbar.classList.toggle("scrolled", window.scrollY > 24);
    };

    window.addEventListener("scroll", updateNavbarScroll, { passive: true });
    updateNavbarScroll();

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const expanded = menuToggle.getAttribute("aria-expanded") === "true";
            menuToggle.setAttribute("aria-expanded", String(!expanded));
            navLinks.classList.toggle("open", !expanded);
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                menuToggle.setAttribute("aria-expanded", "false");
                navLinks.classList.remove("open");
            });
        });
    }

    // 2. Active Nav Link Highlighting on Scroll
    const sections = navAnchors
        .map((anchor) => document.querySelector(anchor.getAttribute("href")))
        .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length > 0) {
        const navObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = `#${entry.target.id}`;
                        navAnchors.forEach((a) => {
                            a.classList.toggle("active", a.getAttribute("href") === id);
                        });
                    }
                });
            },
            { rootMargin: "-35% 0px -55% 0px" }
        );

        sections.forEach((section) => navObserver.observe(section));
    }

    // 3. Scroll Reveal Animation
    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length > 0) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    // 4. Interactive WhatsApp Order Calculator
    const orderRows = Array.from(document.querySelectorAll(".order-row"));
    const orderTotalDisplay = document.getElementById("orderTotalDisplay");
    const orderItemCount = document.getElementById("orderItemCount");
    const buyerNameInput = document.getElementById("buyerName");
    const buyerNoteInput = document.getElementById("buyerNote");
    const sendOrderWaBtn = document.getElementById("sendOrderWa");

    const formatRupiah = (amount) =>
        "Rp " + Number(amount || 0).toLocaleString("id-ID");

    const recalcOrder = () => {
        let total = 0;
        let totalItems = 0;

        orderRows.forEach((row) => {
            const price = Number(row.dataset.price || 0);
            const input = row.querySelector(".qty-input");
            const qty = Math.max(0, parseInt(input?.value || "0", 10) || 0);
            if (input) input.value = String(qty);
            total += price * qty;
            totalItems += qty;
        });

        if (orderTotalDisplay) {
            orderTotalDisplay.textContent = formatRupiah(total);
        }
        if (orderItemCount) {
            orderItemCount.textContent =
                totalItems > 0
                    ? `${totalItems} item dipilih`
                    : "Belum ada item dipilih";
        }
    };

    orderRows.forEach((row) => {
        const input = row.querySelector(".qty-input");
        const buttons = row.querySelectorAll(".qty-btn");

        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const current = Math.max(0, parseInt(input.value || "0", 10) || 0);
                const next = btn.dataset.action === "plus" ? current + 1 : Math.max(0, current - 1);
                input.value = String(next);
                recalcOrder();
            });
        });

        if (input) {
            input.addEventListener("input", recalcOrder);
        }
    });

    recalcOrder();

    if (sendOrderWaBtn) {
        sendOrderWaBtn.addEventListener("click", () => {
            const lines = [];
            let total = 0;

            orderRows.forEach((row) => {
                const name = row.dataset.name || "Produk Abid Fresh";
                const price = Number(row.dataset.price || 0);
                const qty = Math.max(0, parseInt(row.querySelector(".qty-input")?.value || "0", 10) || 0);
                if (qty > 0) {
                    const subtotal = price * qty;
                    total += subtotal;
                    lines.push(`• ${name} x ${qty} = ${formatRupiah(subtotal)}`);
                }
            });

            const buyerName = (buyerNameInput?.value || "").trim();
            const buyerNote = (buyerNoteInput?.value || "").trim();

            let message = "Halo Abid Fresh, saya ingin memesan:\n\n";
            if (lines.length > 0) {
                message += lines.join("\n");
                message += `\n\nEstimasi Total: ${formatRupiah(total)}`;
            } else {
                message += "• Informasi produk & ketersediaan Sari Buah Belimbing / Belimbing Fresh";
            }

            if (buyerName) {
                message += `\nNama Pemesan: ${buyerName}`;
            }
            if (buyerNote) {
                message += `\nCatatan: ${buyerNote}`;
            }
            message += "\n\nMohon info ketersediaan & pengirimannya. Terima kasih!";

            const url = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`;
            window.open(url, "_blank", "noopener,noreferrer");
        });
    }

    // 5. Lightbox Gallery & BPOM Document Preview
    const triggers = Array.from(document.querySelectorAll(".lightbox-trigger"));
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const lightboxClose = document.getElementById("lightboxClose");
    const lightboxPrev = document.getElementById("lightboxPrev");
    const lightboxNext = document.getElementById("lightboxNext");

    let activeIndex = -1;

    const showLightboxAt = (index) => {
        if (!lightbox || !lightboxImg || triggers.length === 0) return;
        activeIndex = (index + triggers.length) % triggers.length;
        const el = triggers[activeIndex];
        lightboxImg.src = el.dataset.src || "";
        lightboxImg.alt = el.querySelector("img")?.alt || "Foto Produk Abid Fresh";
        if (lightboxCaption) {
            lightboxCaption.textContent = el.dataset.caption || "";
        }
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.hidden = true;
        document.body.style.overflow = "";
    };

    triggers.forEach((trigger, index) => {
        trigger.addEventListener("click", () => showLightboxAt(index));
    });

    lightboxClose?.addEventListener("click", closeLightbox);
    lightboxPrev?.addEventListener("click", () => showLightboxAt(activeIndex - 1));
    lightboxNext?.addEventListener("click", () => showLightboxAt(activeIndex + 1));

    lightbox?.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (!lightbox || lightbox.hidden) return;
        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowLeft") showLightboxAt(activeIndex - 1);
        if (event.key === "ArrowRight") showLightboxAt(activeIndex + 1);
    });

    // 6. Auto Year in Footer
    const yearEl = document.getElementById("currentYear");
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }
})();
