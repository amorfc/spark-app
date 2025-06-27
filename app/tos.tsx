import { SafeAreaView } from "@/components/safe-area-view";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
	Button,
	Platform,
	ScrollView,
	useWindowDimensions,
} from "react-native";
import RenderHTML from "react-native-render-html";

export default function ToS() {
	const { width } = useWindowDimensions();
	const {
		i18n: { language },
	} = useTranslation();
	const platformSpecificRightEn =
		Platform.OS === "ios"
			? `  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">12. Apple End User License Agreement (EULA)</h2>
<p>By downloading or using Spark from the Apple App Store, you also agree to Apple's standard End User License Agreement (EULA), available at:
<a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank">https://www.apple.com/legal/internet-services/itunes/dev/stdeula/</a>
</p>`
			: `  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">12. Google End User License Agreement (EULA)</h2>
<p>By downloading or using Spark from the Google Play Store, you also agree to Google's standard End User License Agreement (EULA), available at:
<a href="https://policies.google.com/terms" target="_blank">https://policies.google.com/terms</a>
</p>`;

	const platformSpecificRightTr =
		Platform.OS === "ios"
			? `  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">12. Apple Son Kullanıcı Lisans Sözleşmesi (EULA)</h2>
<p>Apple App Store üzerinden indirerek veya kullanarak, Apple'ın standart Son Kullanıcı Lisans Sözleşmesi’ni (EULA) kabul etmiş olursunuz. EULA’ya şu bağlantıdan ulaşabilirsiniz:
<a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank">https://www.apple.com/legal/internet-services/itunes/dev/stdeula/</a>
</p>`
			: `  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">12. Google End User License Agreement (EULA)</h2>
<p>Google Play Store üzerinden indirerek veya kullanarak, Google'ın standart Son Kullanıcı Lisans Sözleşmesi’ni (EULA) kabul etmiş olursunuz. EULA’ya şu bağlantıdan ulaşabilirsiniz:
<a href="https://policies.google.com/terms" target="_blank">https://policies.google.com/terms</a>
</p>`;

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

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">9. Account Deletion</h2>
  <p>Users have the right to permanently delete their account and all associated data. This can be done directly from the app in the Profile > Settings section. Upon deletion, your data will be removed from our servers within 24 hours.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">10. User Reporting and Blocking</h2>
<p>Spark provides in-app tools for users to report objectionable content or behavior and to block other users. Reports are reviewed promptly, and necessary actions, including content removal and user suspension, may be taken within 24 hours in accordance with our community guidelines.</p>

  <p>To maintain a safe environment, Spark uses automated filters and manual review to detect and restrict objectionable or harmful content. Content that violates our guidelines may be removed without notice. Users can also report content they find inappropriate.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">11. Governing Law</h2>
  <p>This agreement is governed by the laws of the Republic of Turkey. Disputes will be resolved in Istanbul Anadolu Courts.</p>

  ${platformSpecificRightEn}

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">13. Contact</h2>
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

    <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">9. Hesap Silme</h2>
  <p>Kullanıcılar, hesaplarını ve tüm ilişkili verilerini kalıcı olarak silebilir. Bu işlem, uygulama içindeki Profil > Ayarlar bölümünden doğrudan yapılabilir. Silme işlemi gerçekleştiğinde, verileriniz 24 saat içinde sunucumuzdan kaldırılacaktır.</p>

  <p>Güvenli bir ortamı sürdürebilmek için, Spark otomatik filtreler ve elle gözden geçirme kullanarak itibarı dışı ve zararlı içerikleri tespit eder ve sınırlar. Bu yönergeleri ihlal eden içerikler gerektiğinde görünürlükten kaldırılabilir. Kullanıcılar ayrıca kendilerine uygunsuz buldukları içeriği bildirebilirler.</p>

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">10. Kullanıcı Şikayeti ve Engelleme</h2>
  <p>Spark, kullanıcıların uygunsuz içerik veya davranışları uygulama içinden bildirmesi ve diğer kullanıcıları engellemesi için araçlar sunar. Bildirimler hızlı bir şekilde incelenir ve topluluk kurallarımıza uygun olarak içerik silme veya kullanıcıyı askıya alma işlemleri 24 saat içinde gerçekleştirilebilir.</p>


  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">11. Geçerli Hukuk</h2>
  <p>Bu sözleşme Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlık durumunda İstanbul Anadolu Mahkemeleri yetkilidir.</p>

  ${platformSpecificRightTr}

  <h2 style="font-size: 18px; color: #3b82f6; margin-top: 16px;">13. İletişim</h2>
  <p>E-posta: <a href="mailto:SparkCompanyTR@gmail.com">SparkCompanyTR@gmail.com</a></p>

  <div style="margin-top: 24px; font-weight: bold;">
    Bu uygulamayı kullanarak, tüm şartları okuyup anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.
  </div>

</body>`;
	return (
		<SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
			<ScrollView className="p-4" contentContainerStyle={{ flexGrow: 1 }}>
				<RenderHTML
					contentWidth={width}
					source={{ html: language === "tr" ? trToS : enToS }}
				/>
			</ScrollView>
			<Button title="Close" onPress={() => router.back()} />
		</SafeAreaView>
	);
}
