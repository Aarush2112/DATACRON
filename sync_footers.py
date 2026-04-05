import os
import re

footer_template = """    <footer class="footer" aria-label="Footer">
        <div class="container footer-container">
            <div class="left-section">
                <div class="university-badge">
                    <picture>
                        <source srcset="./Assets/RULogo-2.webp" type="image/webp">
                        <img src="./Assets/RULogo-2.png" alt="Rishihood University" width="140" height="44" loading="lazy" />
                    </picture>
                </div>
                <span class="footer__logo">Datacron 2026</span>
            </div>
            <nav class="center-section" aria-label="Footer navigation">
                <a class="footer__link" href="index.html">Home</a>
                <a class="footer__link" href="events.html">Events</a>
                <a class="footer__link" href="speakers.html">Speakers</a>
                <a class="footer__link" href="sponsors.html">Sponsors</a>
                <a class="footer__link" href="team.html">Team</a>
            </nav>
            <div class="right-section">
                <div class="footer__block">
                    <h3 class="footer__title">Connect</h3>
                    <div class="social">
                        <a class="social__icon" href="https://www.instagram.com/datacron.fest?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram" aria-hidden="true"></i></a>
                        <a class="social__icon" href="https://www.linkedin.com/company/datacron-fest/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><i class="fab fa-linkedin-in" aria-hidden="true"></i></a>
                        <a class="social__icon" href="mailto:datacron@rishihood.edu.in" aria-label="Email">
                            <img class="social__icon-img" src="./Assets/email-icon.svg" alt="" aria-hidden="true" width="18" height="18" loading="lazy" />
                        </a>
                    </div>
                </div>
                <div class="footer__block">
                    <h3 class="footer__title">Contact Us</h3>
                    <p class="footer__text">Email: datacron@rishihood.edu.in</p>
                    <p class="footer__text">Phone: +91 94147 12228</p>
                    <p class="footer__contact-person">Kapish Garg - Outreach & Sponsorship Head</p>
                    <p class="footer__text">
                        <a class="footer__location" href="https://maps.app.goo.gl/PZGfSiCdk2HM8J666" target="_blank" rel="noopener noreferrer">Location: Rishihood University Campus</a>
                    </p>
                </div>
            </div>
        </div>
        <div class="footer__bottom">
            <span>© <span id="year"></span> Datacron 2026. All rights reserved.</span>
        </div>
    </footer>"""

def update_footer(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # regex to match <footer ... </footer>
    new_content = re.sub(r'<footer class="footer".*?</footer>', footer_template, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

html_files = [f for f in os.listdir('.') if f.endswith('.html') and f != 'tailwind-template.html']
for html_file in html_files:
    update_footer(html_file)
