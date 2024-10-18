import random
import requests
from faker import Faker
import math
import os
import time

# Initialize Faker to generate random names and information
fake = Faker()
fake.unique.clear()

# Output file name
output_file = "../resultSQL/fake_user_ultimate.sql"

# OpenCageData API key
opencage_api_key = os.getenv('KEY_OPENCAGE')  # Assurez-vous que votre clé API est définie dans la variable d'environnement

# Initialize IDs starting from 100 to avoid conflicts
start_user_id = 100
start_profile_id = 100
start_photo_id = 100
start_location_id = 100

# Define base locations with their coordinates, radius, and number of users
base_locations = [
    {'city_name': 'Lyon', 'lat': 45.7640, 'lon': 4.8357, 'radius_km': 20, 'num_users': 150},
    {'city_name': 'Clermont-Ferrand', 'lat': 45.7935, 'lon': 3.0795, 'radius_km': 350, 'num_users': 200},
    {'city_name': 'Paris', 'lat': 48.8566, 'lon': 2.3522, 'radius_km': 100, 'num_users': 150},
    # Ajoutez d'autres villes avec leurs paramètres spécifiques
]

# Total number of users to generate (optional)
numberUserGenerated = sum(location['num_users'] for location in base_locations)

# Définir des listes pour les genres et les URLs de photos fictives
genders = [
    {'id': 5, 'name': 'Male', 'photo_gender': 'men'},
    {'id': 6, 'name': 'Female', 'photo_gender': 'women'},
    {'id': 7, 'name': 'Non-binary', 'photo_gender': 'men'},  # Alternatif
    {'id': 8, 'name': 'Gender fluid', 'photo_gender': 'women'},  # Alternatif
    {'id': 9, 'name': 'Agender', 'photo_gender': 'men'},  # Alternatif
    {'id': 10, 'name': 'Genderqueer', 'photo_gender': 'women'},  # Alternatif
    {'id': 11, 'name': 'Gender non-conforming', 'photo_gender': 'men'},  # Alternatif
    {'id': 12, 'name': 'Transgender (MTF)', 'photo_gender': 'women'},
    {'id': 13, 'name': 'Transgender (FTM)', 'photo_gender': 'men'},
    {'id': 14, 'name': 'Questioning', 'photo_gender': 'women'}  # Alternatif
]

# Limit the age range to reasonable values
min_age = 18
max_age = 60

# Generate basic tags and biographies
tags = list(range(1, 179))  # Tags already defined in the database

# Liste étendue de biographies
biographies = [
    "J'aime voyager et découvrir de nouvelles cultures.",
    "Passionné(e) de cuisine et de sports.",
    "Je suis ici pour rencontrer de nouvelles personnes et partager des moments.",
    "Adepte de la nature et des randonnées.",
    "La musique et le cinéma sont mes plus grandes passions.",
    "Amoureux(se) des animaux et engagé(e) dans la protection de l'environnement.",
    "Geek de technologie et amateur(trice) de jeux vidéo.",
    "Créatif(ve) dans l'âme, je passe mon temps libre à peindre et dessiner.",
    "Entrepreneur(e) ambitieux(se) visant à changer le monde.",
    "Étudiant(e) en ingénierie, toujours prêt(e) pour un nouveau défi.",
    "Fan de lecture et écrivain(e) en herbe.",
    "Sportif(ve) assidu(e) et toujours en quête de nouvelles aventures.",
    "Passionné(e) de photographie et explorateur(trice) urbain(e).",
    "Amateur(trice) de cuisine internationale et épicurien(ne).",
    "Engagé(e) dans le bénévolat et les causes sociales.",
    "Musicien(ne) dans un groupe local, toujours prêt(e) pour un concert.",
    "Adepte de yoga et de méditation pour une vie équilibrée.",
    "Amateur(trice) de cinéma indépendant et critique de films.",
    "Passionné(e) par l'histoire et les civilisations anciennes.",
    "Entrepreneur(e) digital(e) spécialisé(e) en marketing en ligne.",
    "Amoureux(se) de la mer et pratiquant(e) de sports nautiques.",
    "Créatif(trice) de contenu numérique et influenceur(se) sur les réseaux sociaux.",
    "Amateur(trice) de vin et de gastronomie fine.",
    "Passionné(e) par l'astronomie et les étoiles.",
    "Adepte du minimalisme et de la simplicité volontaire.",
    "Chercheur(euse) scientifique intéressé(e) par les innovations technologiques.",
    "Amateur(trice) de randonnée en montagne et de camping sauvage.",
    "Passionné(e) de danse contemporaine et chorégraphe amateur.",
    "Entrepreneur(se) social(e) visant à améliorer la vie communautaire.",
    "Amateur(trice) de jardinage et de permaculture.",
    "Passionné(e) par les langues étrangères et le polyglottisme.",
    "Adepte de la couture et de la mode éthique.",
    "Amateur(trice) de théâtre et de performances artistiques.",
    "Passionné(e) par le développement personnel et la psychologie.",
    "Adepte de la course de fond et marathonien(ne) en préparation.",
    "Amateur(trice) de bricolage et de projets DIY.",
    "Passionné(e) par les sports extrêmes et l'adrénaline.",
    "Entrepreneur(se) dans le secteur de la santé et du bien-être.",
    "Amateur(trice) de podcasts éducatifs et informatifs.",
    "Passionné(e) par la robotique et l'intelligence artificielle.",
    "Adepte de la plongée sous-marine et des explorations marines.",
    "Amateur(trice) de littérature classique et contemporaine.",
    "Passionné(e) par les startups et l'innovation entrepreneuriale.",
    "Adepte de la photographie de paysage et de nature.",
    "Amateur(trice) de jeux de société et de soirées entre amis.",
    "Passionné(e) par l'écologie et les énergies renouvelables.",
    "Adepte de la natation et des activités aquatiques.",
    "Amateur(trice) de design graphique et d'illustration numérique.",
    "Passionné(e) par le cyclisme et les randonnées à vélo.",
    "Adepte de l'écriture créative et des blogs personnels.",
    "Amateur(trice) de comédie et de spectacles humoristiques."
]

# Function to escape single quotes in strings
def escape_single_quotes(s):
    return s.replace("'", "''")

# Function to generate a photo URL based on gender
def generate_photo_url(photo_gender, index):
    return f"https://randomuser.me/api/portraits/{photo_gender}/{index}.jpg"

# Function to generate sexual preferences (desired genders)
def generate_sexual_preferences(profile_id, total_genders=2):
    preferences = []
    num_preferences = random.randint(1, total_genders)  # 1 or 2 preferences
    selected_genders = random.sample(range(5, 15), num_preferences)
    for gender_id in selected_genders:
        preferences.append(f"({profile_id}, {gender_id})")
    return preferences

# Function to generate a random point within a given radius of a base coordinate
def random_point_within_radius(lat, lon, radius_km):
    # Earth's radius in meters
    earth_radius = 6371e3

    # Convert radius to meters
    radius_m = radius_km * 1000

    # Random distance and bearing
    bearing = random.uniform(0, 2 * math.pi)
    distance = random.uniform(0, radius_m)

    # Calculate the new latitude and longitude
    lat1 = math.radians(lat)
    lon1 = math.radians(lon)

    angular_distance = distance / earth_radius

    lat2 = math.asin(math.sin(lat1) * math.cos(angular_distance) +
                     math.cos(lat1) * math.sin(angular_distance) * math.cos(bearing))

    lon2 = lon1 + math.atan2(math.sin(bearing) * math.sin(angular_distance) * math.cos(lat1),
                             math.cos(angular_distance) - math.sin(lat1) * math.sin(lat2))

    new_lat = math.degrees(lat2)
    new_lon = math.degrees(lon2)

    return new_lat, new_lon

# Function to reverse geocode coordinates to get the city name using OpenCageData API
def reverse_geocode(lat, lon, api_key):
    url = f'https://api.opencagedata.com/geocode/v1/json?q={lat}%2C{lon}&key={api_key}&no_annotations=1&language=fr'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data['results']:
            components = data['results'][0]['components']
            city = components.get('city')
            if not city:
                city = components.get('_normalized_city')
            if not city:
                city = components.get('town')
            if not city:
                city = components.get('village')
            if not city:
                city = components.get('hamlet')
            if not city:
                city = components.get('municipality')
            if not city:
                # Last resort, use 'county' or 'state' or 'Unknown'
                city = components.get('county') or components.get('state') or 'Unknown'
            return city
        else:
            return 'Unknown'
    else:
        print(f"Error: {response.status_code}")
        return 'Unknown'

# Initialize SQL command strings
sql_users = ""
sql_profiles = ""
sql_photos = ""
sql_preferences = ""
sql_tags = ""
sql_locations = ""

current_user_id = start_user_id
current_profile_id = start_profile_id
current_photo_id = start_photo_id
current_location_id = start_location_id

for base_location in base_locations:
    num_users = base_location['num_users']
    base_lat = base_location['lat']
    base_lon = base_location['lon']
    radius_km = base_location['radius_km']
    city_base_name = base_location['city_name']

    for i in range(num_users):
        time.sleep(2)
        # Generate basic information for the user
        first_name = escape_single_quotes(fake.first_name())
        last_name = escape_single_quotes(fake.last_name())
        email = escape_single_quotes(fake.unique.email())
        username = escape_single_quotes(fake.unique.user_name())
        password = '$2a$10$XbbecVun2kCcfnq3ScC/keXUWH5HXDrMI.9Xhwov0vRDsOmi4QE12'  # Hash bcrypt of password '1234'
        created_at = fake.date_between(start_date='-1y', end_date='today')

        # Set is_verified to true
        is_verified = 'true'

        # Choose a random gender
        gender = random.choice(genders)
        age = random.randint(min_age, max_age)

        # Generate a profile
        biography = escape_single_quotes(random.choice(biographies))
        fame_rating = random.randint(1, 10)  # Popularity rating

        # Generate a main photo
        main_photo_url = generate_photo_url(gender['photo_gender'], current_user_id % 100)

        # Generate random coordinates within radius
        lat, lon = random_point_within_radius(base_lat, base_lon, radius_km)

        # Reverse geocode to get city name
        city_name = reverse_geocode(lat, lon, opencage_api_key)
        city_name = escape_single_quotes(city_name)

        # Generate SQL for locations
        sql_locations += f"INSERT INTO locations (location_id, latitude, longitude, city_name) VALUES ({current_location_id}, {lat}, {lon}, '{city_name}');\n"

        # Generate SQL for users
        sql_users += f"INSERT INTO users (id, username, last_name, first_name, email, password, created_at, profile_id, is_verified) VALUES ({current_user_id}, '{username}', '{last_name}', '{first_name}', '{email}', '{password}', '{created_at}', {current_profile_id}, {is_verified});\n"

        # Generate SQL for profiles
        sql_profiles += f"INSERT INTO profiles (profile_id, owner_user_id, biography, gender, age, main_photo_id, location, fame_rating) VALUES ({current_profile_id}, {current_user_id}, '{biography}', {gender['id']}, {age}, {current_photo_id}, {current_location_id}, {fame_rating});\n"

        # Generate SQL for photos
        sql_photos += f"INSERT INTO photos (photo_id, url, owner_user_id) VALUES ({current_photo_id}, '{main_photo_url}', {current_user_id});\n"

        print(f"{2000 - (current_user_id - start_user_id)}  generate {username} at location {city_name}")

        # Generate sexual preferences
        preferences = generate_sexual_preferences(current_profile_id)
        for pref in preferences:
            sql_preferences += f"INSERT INTO profile_sexual_preferences (profile_id, gender_id) VALUES {pref};\n"

        # Add random tags (up to 5 tags per profile)
        selected_tags = random.sample(tags, random.randint(1, 5))
        for tag in selected_tags:
            sql_tags += f"INSERT INTO profile_tag (profile_id, profile_tag) VALUES ({current_profile_id}, {tag});\n"

        # Increment IDs
        current_user_id += 1
        current_profile_id += 1
        current_photo_id += 1
        current_location_id += 1

print("Total users generated:", current_user_id - start_user_id)

# Save the SQL commands to a file
with open(output_file, "w", encoding="utf-8") as file:
    file.write("-- SQL commands to create users\n")
    file.write(sql_users)
    file.write("-- SQL commands to create locations\n")
    file.write(sql_locations)
    file.write("-- SQL commands to create profiles\n")
    file.write(sql_profiles)
    file.write("-- SQL commands to associate photos\n")
    file.write(sql_photos)
    file.write("-- SQL commands for sexual preferences\n")
    file.write(sql_preferences)
    file.write("-- SQL commands to add tags\n")
    file.write(sql_tags)
    file.write("\n-- Updating sequences\n")
    file.write("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));\n")
    file.write("SELECT setval('profile_profile_id_seq', (SELECT MAX(profile_id) FROM profiles));\n")
    file.write("SELECT setval('picture_picture_id_seq', (SELECT MAX(photo_id) FROM photos));\n")
    file.write("SELECT setval('profile_sexual_preferences_id_seq', (SELECT MAX(id) FROM profile_sexual_preferences));\n")
    file.write("SELECT setval('profile_tag_id_seq', (SELECT MAX(id) FROM profile_tag));\n")
    file.write("SELECT setval('locations_location_id_seq', (SELECT MAX(location_id) FROM locations));\n")

print("SQL file generated successfully")