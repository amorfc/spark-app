import { SafeAreaView } from "@/components/safe-area-view";
import { router } from "expo-router";
import { Button, ScrollView, useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";

export default function ToS() {
	const { width } = useWindowDimensions();

	const enToS = `<body style="font-family: sans-serif; color: #1e293b; background-color: #ffffff; padding: 16px; max-width: 100%; line-height: 1.6; font-size: 14px;">

  <h1 style="font-size: 20px; color: #3b82f6; margin-top: 16px;">PRIVACY POLICY (SPARK)</h1>
  <p><strong>Last Updated:</strong> May 25, 2025</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">1. Information We Collect</h2>
  <p>• Location Data: Your real-time location is used to show nearby places.</p>
  <p>• User Content: Comments, reviews, and other content you submit are stored.</p>
  <p>• Device Info: Technical data such as device type and OS may be collected to improve performance.</p>
  <p>• Contact Info (optional): If you contact us, your email address may be stored for support purposes.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">2. How We Use Your Data</h2>
  <p>• Display relevant locations on the map</p>
  <p>• Provide a safe and positive user experience</p>
  <p>• Moderate content and prevent abuse</p>
  <p>• Improve the app and fix issues</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">3. Data Sharing</h2>
  <p>• To comply with legal obligations</p>
  <p>• With service providers for technical infrastructure (e.g., hosting)</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">4. Data Storage and Security</h2>
  <p>All data is stored securely and protected against unauthorized access using encryption and access controls.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">5. Your Rights</h2>
  <p>• Right to access your data</p>
  <p>• Right to request correction or deletion</p>
  <p>• Right to restrict or object to processing</p>
  <p>• Right to data portability</p>
  <p>To exercise your rights, contact us at:<br />Email: <a href="mailto:SparkCompanyTR@gmail.com">SparkCompanyTR@gmail.com</a></p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">6. Children’s Privacy</h2>
  <p>Spark is not intended for children under 13. If such data is detected, it will be deleted immediately.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">7. Changes to This Policy</h2>
  <p>This Privacy Policy may be updated from time to time. Significant changes will be communicated in-app.</p>

  <h1 style="font-size: 20px; color: #3b82f6; margin-top: 16px;">TERMS OF SERVICE AND USER AGREEMENT</h1>
  <p><strong>Effective Date:</strong> May 25, 2025</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">1. Parties</h2>
  <p>This agreement is made between Spark Company ("Service Provider") and the user of the application ("User").</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">2. Description of Service</h2>
  <p>Spark is a platform created by women for women in Turkey to feel safer in public spaces. It includes forums, a comment system, and educational content.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">3. Terms of Use</h2>
  <p>Users must be over 13 years old and identify as women. Males and users under 13 are not permitted. Users agree that submitted content is accurate and respectful.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">4. User Responsibilities</h2>
  <p>Insults, hate speech, violence, and illegal content are prohibited. Users are responsible for their shared content. Spark is not liable for user-generated content.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">5. Content Moderation and Removal</h2>
  <p>Spark reserves the right to review, delete, suspend, or edit user content. Reported content will be reviewed and removed if necessary.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">6. Privacy and Personal Data</h2>
  <p>Personal data is processed in accordance with Turkey’s Personal Data Protection Law (KVKK). See Privacy Policy for details.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">7. Intellectual Property</h2>
  <p>Spark’s name, logo, design, and content belong to Spark Company. Unauthorized copying or distribution is prohibited.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">8. Agreement Changes</h2>
  <p>Service terms may be updated at any time. Changes will be published within the application.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">9. Governing Law</h2>
  <p>This agreement is governed by the laws of the Republic of Turkey. Disputes will be resolved in Istanbul Anadolu Courts.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">10. Contact</h2>
  <p>Email: <a href="mailto:SparkCompanyTR@gmail.com">SparkCompanyTR@gmail.com</a></p>

  <div style="margin-top: 24px; font-weight: bold;">
    By using this application, you acknowledge that you have read, understood, and agreed to all the stated terms.
  </div>

</body>`;

	const trToS = `<body style="font-family: sans-serif; color: #1e293b; background-color: #ffffff; padding: 16px; max-width: 100%; line-height: 1.6; font-size: 14px;">

  <h1 style="font-size: 20px; color: #3b82f6; margin-top: 16px;">GİZLİLİK POLİTİKASI (SPARK)</h1>
  <p><strong>Son Güncelleme:</strong> 25 Mayıs 2025</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">1. Toplanan Bilgiler</h2>
  <p>• Konum Verisi: Gerçek zamanlı konumunuz, yakın yerleri göstermek için kullanılır.</p>
  <p>• Kullanıcı İçeriği: Gönderdiğiniz yorumlar, değerlendirmeler ve diğer içerikler saklanır.</p>
  <p>• Cihaz Bilgisi: Cihaz türü ve işletim sistemi gibi teknik veriler performansı artırmak için toplanabilir.</p>
  <p>• İletişim Bilgileri (isteğe bağlı): Bizimle iletişime geçerseniz, destek amacıyla e-posta adresiniz saklanabilir.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">2. Verilerin Kullanımı</h2>
  <p>• Harita üzerinde ilgili yerleri göstermek</p>
  <p>• Güvenli ve olumlu bir kullanıcı deneyimi sağlamak</p>
  <p>• İçeriği denetlemek ve kötüye kullanımı önlemek</p>
  <p>• Uygulamayı iyileştirmek ve hataları düzeltmek</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">3. Verilerin Paylaşımı</h2>
  <p>• Yasal yükümlülüklere uymak amacıyla</p>
  <p>• Teknik altyapı sağlayıcılarıyla (örneğin barındırma hizmeti)</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">4. Verilerin Saklanması ve Güvenliği</h2>
  <p>Tüm veriler güvenli bir şekilde saklanır ve yetkisiz erişime karşı şifreleme ve erişim kontrolleri ile korunur.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">5. Haklarınız</h2>
  <p>• Verilerinize erişme hakkı</p>
  <p>• Düzeltme veya silme talebinde bulunma hakkı</p>
  <p>• İşlemenin kısıtlanmasını veya itiraz edilmesini isteme hakkı</p>
  <p>• Veri taşınabilirliği talep etme hakkı</p>
  <p>Haklarınızı kullanmak için bizimle iletişime geçin:<br />E-posta: <a href="mailto:SparkCompanyTR@gmail.com">SparkCompanyTR@gmail.com</a></p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">6. Çocukların Gizliliği</h2>
  <p>Spark 13 yaş altı çocuklara yönelik değildir. Böyle bir veri tespit edilirse, derhal silinecektir.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">7. Politika Değişiklikleri</h2>
  <p>Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler uygulama içinde bildirilecektir.</p>

  <h1 style="font-size: 20px; color: #3b82f6; margin-top: 16px;">HİZMET ŞARTLARI VE KULLANICI SÖZLEŞMESİ</h1>
  <p><strong>Yürürlük Tarihi:</strong> 25 Mayıs 2025</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">1. Taraflar</h2>
  <p>Bu sözleşme Spark Company ("Hizmet Sağlayıcı") ile uygulamayı kullanan kişi ("Kullanıcı") arasında yapılmıştır.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">2. Hizmetin Tanımı</h2>
  <p>Spark, Türkiye'deki kadınların kamusal alanlarda kendilerini daha güvende hissetmelerini sağlamak için kadınlar tarafından oluşturulmuş bir platformdur. Topluluk forumları, yorum sistemi ve eğitici içerikler içerir.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">3. Kullanım Koşulları</h2>
  <p>Kullanıcıların 13 yaşından büyük ve kadın olması gereklidir. Erkekler ve 13 yaş altı bireyler uygulamayı kullanamaz. Kullanıcılar, paylaştıkları içeriğin doğru ve saygılı olduğunu kabul eder.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">4. Kullanıcı Sorumlulukları</h2>
  <p>Hakaret, nefret söylemi, şiddet ve yasa dışı içerikler yasaktır. Kullanıcı, paylaştığı içerikten sorumludur. Spark kullanıcı kaynaklı içerikten sorumlu tutulamaz.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">5. İçerik Denetimi ve Kaldırma</h2>
  <p>Spark, kullanıcı içeriğini inceleme, silme, askıya alma veya düzenleme hakkına sahiptir. Şikayet edilen içerikler incelenir ve gerekli görülürse kaldırılır.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">6. Gizlilik ve Kişisel Veriler</h2>
  <p>Kişisel veriler, Türkiye'nin 6698 sayılı KVKK yasasına uygun olarak işlenir. Ayrıntılar için Gizlilik Politikası'na bakınız.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">7. Fikri Mülkiyet</h2>
  <p>Spark'ın adı, logosu, tasarımı ve içeriği Spark Company'e aittir. Bunlar izinsiz kopyalanamaz, çoğaltılamaz veya dağıtılamaz.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">8. Sözleşme Değişiklikleri</h2>
  <p>Hizmet şartları herhangi bir zamanda değiştirilebilir. Değişiklikler uygulama içinde yayınlanarak yürürlüğe girer.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">9. Geçerli Hukuk</h2>
  <p>Bu sözleşme Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlık durumunda İstanbul Anadolu Mahkemeleri yetkilidir.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">10. İletişim</h2>
  <p>E-posta: <a href="mailto:SparkCompanyTR@gmail.com">SparkCompanyTRm@gmail.com</a></p>

  <div style="margin-top: 24px; font-weight: bold;">
    Bu uygulamayı kullanarak, tüm şartları okuyup anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.
  </div>

</body>`;
	return (
		<SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
			<ScrollView className="p-4" contentContainerStyle={{ flexGrow: 1 }}>
				<RenderHTML contentWidth={width} source={{ html: trToS }} />
			</ScrollView>
			<Button title="Close" onPress={() => router.back()} />
		</SafeAreaView>
	);
}
