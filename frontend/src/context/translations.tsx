"use client";
import { Language } from "./LanguageContext";

// Translations
export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    home: "Home",
    safariTours: "Safari Tours",
    snowmobileRental: "Snowmobile Rental",
    contactUs: "Contact Us",

    // Home Page - Hero
    heroTitle: "Arctic Adventure Awaits",
    heroSubtitle:
      "Experience the magic of Lapland through premium snowmobile safaris or personal adventures with our wide range of vehicles and expert guides.",

    // Home Page - Intro
    introTitle: "Your gateway to arctic adventures",
    introText1:
      "Discover the beauty of nature with Ukkis Safaris. We offer a variety of tours and adventures that allow you to explore the stunning landscapes and wildlife of our region.",
    introText2:
      "Our experienced guides are passionate about sharing their knowledge and love for the outdoors. They will ensure that your adventure is safe, enjoyable, and unforgettable.",

    // Home Page - Features
    professionalGuidance: "Professional Guidance",
    professionalGuidanceDesc:
      "Expert guides ensuring your safety and enjoyment",
    premiumEquipment: "Premium Equipment",
    premiumEquipmentDesc:
      "Top-quality snowmobiles maintained to the highest standards",
    unforgettableExperiences: "Unforgettable Experiences",
    unforgettableExperiencesDesc: "Create memories that will last a lifetime",

    // Safety Section
    safetyTitle: "Safety First",
    safetyText1:
      "At Ukkis Safaris, your safety is our top priority. All our guides are certified professionals with extensive training in wilderness safety and first aid.",
    safetyText2:
      "We provide comprehensive safety briefings before every tour and ensure all equipment meets the highest safety standards. Our snowmobiles are regularly maintained and inspected.",
    safetyText3:
      "We carefully plan our routes considering weather conditions and group experience levels. Emergency communication equipment is always available during tours.",

    // CTA Section
    ctaTitle: "Ready for Your Adventure?",
    ctaSubtitle: "Book your dream safari experience today",
    ctaButton: "Book Now",
    viewAllTours: "View All Tours",

    // Safety Features
    certifiedGuides: "Certified Guides",
    certifiedGuidesDesc:
      "All guides are certified professionals with extensive Arctic experience",
    emergencyPrepared: "Emergency Prepared",
    emergencyPreparedDesc:
      "Comprehensive emergency protocols and wilderness first aid training",

    // Footer
    companyDescription:
      "Premium Arctic adventures in the heart of Lapland, Finland.",
    quickLinks: "Quick Links",
    booking: "Booking",
    contact: "Contact",
    address: "Address",
    allRightsReserved: "All rights reserved",

    // Contact Page
    contactPageTitle: "Contact Us",
    contactPageSubtitle:
      "Get in touch with us for bookings, questions, or any other inquiries. We are here to help make your Arctic adventure unforgettable.",
    getInTouch: "Get In Touch",
    sendUsMessage: "Send Us a Message",
    yourName: "Your name",
    yourEmail: "your.email@example.com",
    whatIsThisRegarding: "What is this regarding?",
    tellUsMore: "Tell us more about your inquiry...",
    sending: "Sending...",
    messageSent: "Your message has been sent. We will contact you soon.",
    errorOccurred: "An error occurred. Please try again.",
    connectionFailed: "Connection to server failed.",
    findUs: "Find Us",
    required: "*",

    // Bookings Page
    safariToursTab: "Safari Tours",
    snowmobileRentalTab: "Snowmobile Rental",
    selectYourTour: "Select Your Tour",
    chooseYourAdventure: "Choose Your Arctic Adventure",
    selectFromPremiumCollection:
      "Select from our premium collection of Lapland experiences",
    loadingTours: "Loading tours...",
    showingDemoTours: "Showing demo tours instead",
    continue: "Continue",
    tourDetails: "Tour Details",
    customize: "Customize",
    customizeYourExperience: "Customize Your Experience",
    personalizeYourAdventure: "Personalize your Arctic adventure",
    confirm: "Confirm",
    confirmYourBooking: "Confirm Your Booking",
    reviewBookingDetails: "Please review your booking details and confirm",
    chooseDate: "Select Date",
    chooseTime: "Select Start Time",
    selectAddons: "Select Add-ons",
    numberOfParticipants: "Number of Participants",
    gearSizes: "Gear Sizes for Each Participant",
    participant: "Participant",
    participantName: "Participant Name",
    enterNameFor: "Enter name for",
    overalls: "Overalls",
    boots: "Boots",
    gloves: "Gloves",
    helmet: "Helmet",
    addonsAndSummary: "Add-Ons and Summary",
    enhanceYourExperience: "Enhance your experience with our optional add-ons",
    optionalAddons: "Optional Add-ons",
    contactInformation: "Contact Information",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    bookingSummary: "Booking Summary",
    tour: "Tour",
    selectedAddons: "Selected Add-ons",
    none: "None",
    baseTourPrice: "Base Tour Price",
    addonsTotal: "Add-ons Total",
    finalTotal: "Final Total",
    continueToCustomize: "Continue to Customize",
    confirmAndContinue: "Confirm & Continue",
    confirmBooking: "Confirm Booking",
    backToSelection: "Back to Selection",
    backToCustomization: "Back to Customization",

    // Snowmobile Rental
    contactForRental:" Rent a Snowmobile for Your Private Adventure, booking calendar will be added soon.",
    rentSnowmobileTitle: "Contact below for Snowmobile Rental",
    rentSnowmobileDescription:
      "Explore the Arctic wilderness at your own pace. Our snowmobiles are perfect for experienced riders who want the freedom to create their own adventure.",
    flexibleDuration: "Flexible Duration",
    flexibleDurationDesc:
      "Rent by the hour - perfect for short trips or full-day adventures",
    qualityEquipment: "Quality Equipment",
    qualityEquipmentDesc: "Well-maintained modern snowmobiles",
    from50PerHour: "From €50/hour",
    competitivePricing: "Competitive pricing for premium snowmobiles",
    safetyFirst: "Safety First",
    safetyFirstDesc: "All necessary safety gear included",
    note: "Note",
    driverLicenseRequired:
      "Valid driver's license required. Experience with snowmobiles recommended.",
    checkAvailability: "Check Availability & Book",

    bookingSuccess: "Booking Successful!",
    bookingSuccessMessage:
      "Your booking has been confirmed. Check your email for details.",
    returnHome: "Return to Home",

    // Tours Section
    bookingsPageTitle: "Bookings",
    toursTitle: "Our Safari Tours",
    toursSubtitle: "Choose Your Adventure",
    viewDetails: "View Details",
    participants: "Participants",
    duration: "Duration",
    difficulty: "Difficulty",
    maxPeople: "Max",
    people: "people",
    person: "person",
    selectedTour: "Selected",

    // Safari Tour Names & Descriptions (by slug)
    tour_snowmobile_name: "Snowmobile Safari",
    tour_snowmobile_desc:
      "Explore the Arctic wilderness with our expert guides.",
    tour_enduro_name: "Enduro Bike Tour",
    tour_enduro_desc:
      "Experience the thrill of off-road biking in the beautiful Finnish wilderness.",
    tour_extreme_name: "ATV Extreme Safari",
    tour_extreme_desc: "For thrill-seekers looking for an advanced challenge.",

    // Contact
    contactTitle: "Get in Touch",
    contactSubtitle: "We're here to help you plan your perfect adventure",
    name: "Name",
    email: "Email",
    phone: "Phone",
    subject: "Subject",
    message: "Message",
    sendMessage: "Send Message",

    // Bookings
    contactForBooking: "Contact Us for Booking, booking calendar will be added soon.",
    bookingTitle: "Book Your Adventure",
    selectTour: "Select Tour",
    selectDate: "Select Date",
    selectTime: "Select Time",
    totalPrice: "Total Price",
    customerInformation: "Customer Information",
    additionalNotes: "Additional Notes",
    proceedToPayment: "Proceed to Payment",

    // Admin
    adminPanel: "Admin Panel",
    bookings: "Bookings",
    packages: "Packages",
    departures: "Departures",
    snowmobiles: "Snowmobiles",
    logout: "Logout",

    // Common
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    status: "Status",
    date: "Date",
    time: "Time",
    price: "Price",
    total: "Total",

    // Snowmobile Rental Page
    snowmobileRentalPageTitle: "Snowmobile Rental",
    snowmobileRentalPageSubtitle:
      "Book a snowmobile for your private adventure",
    checkAvailabilityButton: "Check Availability",
    selectDateLabel: "Select Date",
    selectedDate: "Selected",
    startTimeLabel: "Start Time",
    endTimeLabel: "End Time",
    durationLabel: "Duration",
    hours: "hours",
    estimatedTotal: "Estimated Total",
    checking: "Checking...",
    backToTimeSelection: "← Back to time selection",
    noSnowmobilesAvailable: "No snowmobiles available for the selected time.",
    tryDifferentTime: "Please try different dates/times.",
    selectASnowmobile: "Select a Snowmobile",
    year: "Year",
    plate: "Plate",
    yourDetails: "Your Details",
    processing: "Processing...",

    // Add-ons
    addon_photo_title: "Professional Photography",
    addon_photo_desc: "High-quality photos of your adventure",
    addon_meal_title: "Hot Meal & Drinks",
    addon_meal_desc: "Traditional Lapland lunch by campfire",
    addon_pickup_title: "Hotel Pickup & Drop-off",
    addon_pickup_desc: "Convenient transportation service",

    // Footer
    footerAbout: "About Us",
    footerServices: "Services",
    footerContact: "Contact",
    footerFollow: "Follow Us",
    footerRights: "All rights reserved",
  },
  fi: {
    // Navigation
    home: "Etusivu",
    safariTours: "Safari-retket",
    snowmobileRental: "Moottorikelkkavuokraus",
    contactUs: "Ota yhteyttä",

    // Home Page - Hero
    heroTitle: "Arktinen seikkailu odottaa",
    heroSubtitle:
      "Koe Lapin taika premium moottorikelkkasafareilla tai henkilökohtaisilla seikkailuilla laajan ajoneuvovalikoimamme ja asiantuntevan opastuksen avulla.",

    // Home Page - Intro
    introTitle: "Porttisi arktisiin seikkailuihin",
    introText1:
      "Löydä luonnon kauneus Ukkis Safarien kanssa. Tarjoamme erilaisia retkiä ja seikkailuja, joiden avulla voit tutkia alueemme upeat maisemat ja villieläimet.",
    introText2:
      "Kokeneet oppaamme ovat intohimoisia jakamaan tietämyksensä ja rakkautensa ulkoilmaa kohtaan. He varmistavat, että seikkailusi on turvallinen, nautinnollinen ja unohtumaton.",

    // Home Page - Features
    professionalGuidance: "Ammattimainen opastus",
    professionalGuidanceDesc:
      "Asiantuntevat oppaat varmistavat turvallisuutesi ja nautintosi",
    premiumEquipment: "Huippulaatuiset varusteet",
    premiumEquipmentDesc:
      "Korkealaatuiset moottorikelkat, jotka huolletaan korkeimpien standardien mukaisesti",
    unforgettableExperiences: "Unohtumattomia kokemuksia",
    unforgettableExperiencesDesc: "Luo muistoja, jotka kestävät koko elämän",

    // Safety Section
    safetyTitle: "Turvallisuus ensin",
    safetyText1:
      "Ukkis Safareilla turvallisuutesi on tärkein prioriteettimme. Kaikki oppaamme ovat sertifioituja ammattilaisia, joilla on laaja koulutus erämaaturvallisuudesta ja ensiavusta.",
    safetyText2:
      "Tarjoamme kattavat turvallisuusohjeistukset ennen jokaista retkeä ja varmistamme, että kaikki varusteet täyttävät korkeimmat turvallisuusstandardit. Moottorikelkkamme huolletaan ja tarkistetaan säännöllisesti.",
    safetyText3:
      "Suunnittelemme reittimme huolellisesti ottaen huomioon sääolosuhteet ja ryhmän kokemustason. Hätäviestintälaitteet ovat aina saatavilla retkien aikana.",

    // CTA Section
    ctaTitle: "Valmis seikkailuun?",
    ctaSubtitle: "Varaa unelmiesi safari-kokemus tänään",
    ctaButton: "Varaa nyt",
    viewAllTours: "Katso kaikki retket",

    // Safety Features
    certifiedGuides: "Sertifioidut oppaat",
    certifiedGuidesDesc:
      "Kaikki oppaat ovat sertifioituja ammattilaisia, joilla on laaja arktinen kokemus",
    emergencyPrepared: "Hätätilanteisiin varauduttu",
    emergencyPreparedDesc:
      "Kattavat hätätilanteiden protokollat ja erämainen ensiapukoulutus",

    // Footer
    companyDescription:
      "Premium arktisia seikkailuja Lapin sydämessä, Suomessa.",
    quickLinks: "Pikalinkit",
    booking: "Varaus",
    contact: "Yhteystiedot",
    address: "Osoite",
    allRightsReserved: "Kaikki oikeudet pidätetään",

    // Contact Page
    contactPageTitle: "Ota yhteyttä",
    contactPageSubtitle:
      "Ota meihin yhteyttä varauksiin, kysymyksiin tai muihin tiedusteluihin. Autamme sinua tekemään arktisesta seikkailustasi unohtumattoman.",
    getInTouch: "Ota yhteyttä",
    sendUsMessage: "Lähetä meille viesti",
    yourName: "Nimesi",
    yourEmail: "sinun.sähköposti@esimerkki.fi",
    whatIsThisRegarding: "Mistä on kyse?",
    tellUsMore: "Kerro meille lisää kyselystäsi...",
    sending: "Lähetetään...",
    messageSent: "Viestisi on lähetetty. Otamme sinuun yhteyttä pian.",
    errorOccurred: "Tapahtui virhe. Yritä uudelleen.",
    connectionFailed: "Yhteys palvelimeen epäonnistui.",
    findUs: "Löydä meidät",
    required: "*",

    // Bookings Page
    safariToursTab: "Safari-retket",
    snowmobileRentalTab: "Moottorikelkkavuokraus",
    selectYourTour: "Valitse retkesi",
    chooseYourAdventure: "Valitse arktinen seikkailusi",
    selectFromPremiumCollection:
      "Valitse premium-kokoelmastamme Lapin kokemuksia",
    loadingTours: "Ladataan retkiä...",
    showingDemoTours: "Näytetään demoretkiä sen sijaan",
    continue: "Jatka",
    tourDetails: "Retken tiedot",
    customize: "Mukauta",
    customizeYourExperience: "Mukauta kokemuksesi",
    personalizeYourAdventure: "Personoi arktinen seikkailusi",
    confirm: "Vahvista",
    confirmYourBooking: "Vahvista varauksesi",
    reviewBookingDetails: "Tarkista varaustietosi ja vahvista",
    chooseDate: "Valitse päivä",
    chooseTime: "Valitse aloitusaika",
    selectAddons: "Valitse lisäpalvelut",
    numberOfParticipants: "Osallistujien määrä",
    gearSizes: "Varusteiden koot jokaiselle osallistujalle",
    participant: "Osallistuja",
    participantName: "Osallistujan nimi",
    enterNameFor: "Anna nimi",
    overalls: "Haalarit",
    boots: "Saappaat",
    gloves: "Käsineet",
    helmet: "Kypärä",
    addonsAndSummary: "Lisäpalvelut ja yhteenveto",
    enhanceYourExperience: "Paranna kokemustasi valinnaisilla lisäpalveluilla",
    optionalAddons: "Valinnaiset lisäpalvelut",
    contactInformation: "Yhteystiedot",
    fullName: "Koko nimi",
    emailAddress: "Sähköpostiosoite",
    phoneNumber: "Puhelinnumero",
    bookingSummary: "Varausyhteenveto",
    tour: "Retki",
    selectedAddons: "Valitut lisäpalvelut",
    none: "Ei mitään",
    baseTourPrice: "Retken perushinta",
    addonsTotal: "Lisäpalvelut yhteensä",
    finalTotal: "Loppusumma",
    continueToCustomize: "Jatka muokkaamiseen",
    confirmAndContinue: "Vahvista ja jatka",
    confirmBooking: "Vahvista varaus",
    backToSelection: "Takaisin valintaan",
    backToCustomization: "Takaisin muokkaukseen",

    // Snowmobile Rental
    rentSnowmobileTitle:
      "Vuokraa moottorikelkka omalle yksityiselle seikkailulle, varauskalenteri lisätään pian.",
    contactForRental:
      "Ota meihin yhteyttä moottorikelkkavuokrausta varten",
    rentSnowmobileDescription:
      "Tutustu arktiseen erämaahan omassa tahdissasi. Moottorikelkkamme sopivat täydellisesti kokeneille kuljettajille, jotka haluavat vapauden luoda oman seikkailunsa.",
    flexibleDuration: "Joustava kesto",
    flexibleDurationDesc:
      "Vuokraa tunneittain - täydellinen lyhyille retkille tai koko päivän seikkailuihin",
    qualityEquipment: "Laadukkaat varusteet",
    qualityEquipmentDesc: "Hyvin huolletut modernit moottorikelkat",
    from50PerHour: "Alkaen 50€/tunti",
    competitivePricing: "Kilpailukykyiset hinnat premium-moottorikelkoille",
    safetyFirst: "Turvallisuus ensin",
    safetyFirstDesc: "Kaikki tarvittavat turvavarusteet sisältyvät",
    note: "Huomio",
    driverLicenseRequired:
      "Voimassa oleva ajokortti vaaditaan. Kokemus moottorikelkoista suositeltavaa.",
    checkAvailability: "Tarkista saatavuus ja varaa",

    bookingSuccess: "Varaus onnistui!",
    bookingSuccessMessage:
      "Varauksesi on vahvistettu. Tarkista sähköpostisi saadaksesi lisätietoja.",
    returnHome: "Palaa etusivulle",

    // Tours Section
    bookingsPageTitle: "Safari varaukset",
    contactForBooking: "Ota yhteyttä alta varataksesi safari-retken, varauskalenteri lisätään pian.",
    toursTitle: "Safari-retkemme",
    toursSubtitle: "Valitse seikkailusi",
    viewDetails: "Näytä tiedot",
    participants: "Osallistujat",
    duration: "Kesto",
    difficulty: "Vaikeustaso",
    maxPeople: "Max",
    people: "henkilöä",
    person: "henkilö",
    selectedTour: "Valittu",

    // Safari Tour Names & Descriptions (by slug)
    tour_snowmobile_name: "Moottorikelkkasafari",
    tour_snowmobile_desc:
      "Tutustu arktiseen erämaahan asiantuntevien oppaiden kanssa.",
    tour_enduro_name: "Enduro-pyöräretki",
    tour_enduro_desc:
      "Koe maastopyöräilyn jännitys kauniissa suomalaisessa erämaassa.",
    tour_extreme_name: "ATV Extreme -safari",
    tour_extreme_desc:
      "Jännityksenhakijoille, jotka etsivät edistynyttä haastetta.",

    // Contact
    contactTitle: "Ota yhteyttä",
    contactSubtitle: "Autamme sinua suunnittelemaan täydellisen seikkailun",
    name: "Nimi",
    email: "Sähköposti",
    phone: "Puhelin",
    subject: "Aihe",
    message: "Viesti",
    sendMessage: "Lähetä viesti",

    // Bookings
    bookingTitle: "Varaa seikkailusi",
    selectTour: "Valitse retki",
    selectDate: "Valitse päivä",
    selectTime: "Valitse aika",
    totalPrice: "Kokonaishinta",
    customerInformation: "Asiakastiedot",
    additionalNotes: "Lisätiedot",
    proceedToPayment: "Siirry maksamaan",

    // Admin
    adminPanel: "Hallintapaneeli",
    bookings: "Varaukset",
    packages: "Paketit",
    departures: "Lähdöt",
    snowmobiles: "Moottorikelkat",
    logout: "Kirjaudu ulos",

    // Common
    cancel: "Peruuta",
    save: "Tallenna",
    delete: "Poista",
    edit: "Muokkaa",
    add: "Lisää",
    search: "Hae",
    filter: "Suodata",
    loading: "Ladataan...",
    error: "Virhe",
    success: "Onnistui",
    close: "Sulje",
    back: "Takaisin",
    next: "Seuraava",
    previous: "Edellinen",
    submit: "Lähetä",
    status: "Tila",
    date: "Päivämäärä",
    time: "Aika",
    price: "Hinta",
    total: "Yhteensä",

    // Snowmobile Rental Page
    snowmobileRentalPageTitle: "Moottorikelkkavuokraus",
    snowmobileRentalPageSubtitle:
      "Varaa moottorikelkka omalle yksityiselle seikkailulle",
    checkAvailabilityButton: "Tarkista saatavuus",
    selectDateLabel: "Valitse päivä",
    selectedDate: "Valittu",
    startTimeLabel: "Aloitusaika",
    endTimeLabel: "Lopetusaika",
    durationLabel: "Kesto",
    hours: "tuntia",
    estimatedTotal: "Arvioitu kokonaishinta",
    checking: "Tarkistetaan...",
    backToTimeSelection: "← Takaisin ajan valintaan",
    noSnowmobilesAvailable: "Valitulle ajalle ei ole vapaita moottorikelkkoja.",
    tryDifferentTime: "Ole hyvä ja yritä eri päiviä/aikoja.",
    selectASnowmobile: "Valitse moottorikelkka",
    year: "Vuosi",
    plate: "Rekisterinumero",
    yourDetails: "Omat tietosi",
    processing: "Käsitellään...",

    // Add-ons
    addon_photo_title: "Ammattivalokuvaaja",
    addon_photo_desc: "Korkealaatuisia kuvia seikkailustasi",
    addon_meal_title: "Lämmin ateria ja juomat",
    addon_meal_desc: "Perinteinen lappalainen lounas nuotion ääressä",
    addon_pickup_title: "Hotellikuljetus",
    addon_pickup_desc: "Kätevä kuljetuspalvelu",

    // Footer
    footerAbout: "Tietoa meistä",
    footerServices: "Palvelut",
    footerContact: "Yhteystiedot",
    footerFollow: "Seuraa meitä",
    footerRights: "Kaikki oikeudet pidätetään",
  },
};
