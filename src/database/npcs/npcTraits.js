const firstNames = [
    "Alex", "Jamie", "Sam", "Morgan", "Casey", "Jordan", "Jenry", "Taylor", "Quinn",
    "Avery", "Riley", "Parker", "Sawyer", "Blake", "Hayden", "Dakota", "Reese", "Bailey",
    "Cameron", "Drew", "Elliot", "Charlie", "Skyler", "Spencer", "Emerson", "Finley", "Reagan",
    "Logan", "Alexis", "Micah", "Pat", "Robin", "Sidney", "Andy", "Lee", "Shannon", "Jessie",
    "Case", "Kris", "Toni", "Nicky", "Chris", "Jordan", "Marion", "Fran", "Lou", "Jody", "Terry",
    "Kelly", "Leslie", "Dana", "Stacy", "Jamie", "Adrian", "Robin", "Brook", "Dallas", "London",
    "Paris", "Devon", "Kendall", "Payton", "Phoenix", "Ashton", "Beau", "Lane", "Harley", "Rowan",
    "Shiloh", "Winter", "Arden", "Sage", "Lennon", "Remy", "Milan", "Tatum", "Peyton", "Ellen",
    "Cynthia", "Rebecca", "Tim", "Daniel",
];




const lastNames = [
    "Hicks", "Ripley", "Burke", "Dietrich", "Jorden", "Frost", "Crowe", "Apone", "Spunkmeyer",
    "Hudson", "Gorman", "Bobbinger",
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill",
    "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell",
    "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner",
    "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris",
    "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper",
    "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox",
    "Ward", "Richardson", "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett",
    "Gray", "Mendoza", "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders",
    "Patel", "Myers", "Long", "Ross", "Foster", "Jimenez", "Powell", "Jenkins",
    "Perry", "Russell", "Sullivan", "Bell", "Coleman", "Butler", "Henderson",
    "Barnes", "Gonzales", "Fisher", "Vasquez", "Simmons", "Romero", "Jordan",
    "Patterson", "Alexander", "Hamilton", "Graham", "Reynolds", "Griffin", "Wallace"
];






const appearances = [
    "Short hair with a sharp jawline and piercing blue eyes.",
    "Long curly hair, freckled face, and a warm, inviting smile.",
    "Bald head, with a meticulously groomed beard and deep-set brown eyes.",
    "Wavy shoulder-length hair, tan skin, and striking green eyes.",
    "Short cropped hair, glasses perched on the nose, and a thoughtful expression.",
    "Shaved sides with a top knot, tattoo sleeves, and a confident stance.",
    "Long straight black hair, pale skin, and dark, almond-shaped eyes.",
    "Buzz cut, with a rugged scar across the cheek and intense gray eyes.",
    "Afro hairstyle, with a bright, contagious laugh and sparkling hazel eyes.",
    "Medium-length hair tucked behind ears, a sprinkle of freckles, and soft brown eyes.",
    "Short, spikey hair, a nose ring, and a playful smirk.",
    "Ponytail, athletic build, with focused and determined amber eyes.",
    "Long, braided hair, high cheekbones, and gentle blue-green eyes.",
    "Curly bob, rosy cheeks, and bright, curious light brown eyes.",
    "Thick, wavy hair pulled back, a smattering of freckles, and keen green eyes.",
    "Cropped hair with silver streaks, laugh lines, and wise dark eyes.",
    "Flowing locks, a sun-kissed glow, and oceanic blue eyes.",
    "Neatly trimmed hair, a slight beard, and warm, welcoming brown eyes.",
    "Slicked-back hair, a sharp suit, and calculating steel-gray eyes.",
    "Messy bun, a soft smile, and kind hazel eyes framed by glasses.",
    "Military buzz cut, a stern look, and piercing ice-blue eyes.",
    "Flowery tattoos peaking from under the collar, short pixie cut, and lively green eyes.",
    "Long dreadlocks, a beaming smile, and dark, soulful eyes.",
    "Short hair, a cybernetic eye that glows faintly blue, and a confident smirk.",
    "Long hair with neon streaks, a mechanical arm with intricate designs, and a curious gaze.",
    "Buzz cut, tattooed skin that shifts patterns and colors subtly, and sharp green eyes.",
    "Shaved head, a small data port at the temple, and intense amber eyes.",
    "Wavy hair, a prosthetic leg with a sleek, metallic finish, and bright hazel eyes.",
    "Braids with embedded luminescent threads, warm brown eyes, and a radiant smile.",
    "Slicked-back hair, an ear replaced with a sophisticated audio interface, and calculating gray eyes.",
    "Curly top, a series of small, glowing cybernetic enhancements along the jawline, and lively blue eyes.",
    "Short, spiked hair with a silver hue, a holographic tattoo across one arm, and deep-set brown eyes.",
    "Medium-length hair with a subtle iridescence, bioluminescent freckles, and soft green eyes.",
    "Long, sleek hair, a holographic visor covering the eyes, displaying data streams.",
    "Pixie cut, a discreet nanotech mesh skin overlay that hardens defensively, and piercing blue eyes.",
    "Undercut with digital motif hair tattoos, cybernetic fingertips for precision work, and warm, inviting amber eyes.",
    "Dreadlocks with integrated data cables, a cybernetic chest plate visible at the collar, and soulful dark eyes.",
    "Shoulder-length, straight hair, a retractable blade prosthetic arm, and focused, icy blue eyes.",
    "Buzzed sides, a neural jack behind one ear, nanite-embedded tattoos that move, and keen silver eyes.",
    "Bald, with skin that changes texture with mood, and vibrant, multifaceted green eyes.",
    "Flowing locks with magnetic beads, a voice modulator collar, and deep, mysterious dark eyes.",
    "Cropped hair with UV-reactive dye, light-sensitive eye implants, and a mischievous grin.",
    "High ponytail, back-mounted nano-wing deployment for zero-G maneuverability, and determined brown eyes.",
    "Tightly coiled hair, forearm-mounted toolkit implants, and sharp, analytical hazel eyes.",
    "Mullet with smart-fiber strands, subdermal armor plating along the arms, and bright, observant grey eyes.",
    "Shaggy hair, cheekbone-integrated comms interface, and soft, thoughtful light brown eyes.",
    "Clean-cut, with a sleek graphene suit that adapts to body temperature, an embedded ID chip visible under the skin of the wrist, and confident steel-blue eyes.",
    "Scars crisscrossing over one side of the face, a military-grade cybernetic arm with a built-in weapon system, and experienced dark eyes that have seen too much.",
    "Wire-framed glasses with augmented reality capabilities, hair tied back and peppered with smart-sensor nodes, and curious, intelligent green eyes.",
    "Hair perfectly styled, a suit with nanofiber that cleans itself, an earpiece that's almost invisible, conducting calls through bone conduction, and sharp hazel eyes.",
    "Buzz cut, a face with tactical HUD implants around one eye, body armor melded with skin for a seamless look, and vigilant light grey eyes.",
    "Loose, flowing hair with subtle, shifting color highlights, skin adorned with bioluminescent tattoos that react to mood, and deep, contemplative violet eyes.",
    "A slight, unassuming figure with a cybernetic eye displaying data streams, practical clothing with hidden pockets for gadgets, and keen, observant amber eyes.",
    "Neatly combed hair with a hint of artificial silver strands, business attire integrated with holographic display fibers, and calculating ice-blue eyes."
]



const personalities = [
    "Eager to prove themselves, coming from a small village with big dreams.",
    "Always looking for the next adventure, fueled by tales of their explorer parents.",
    "Ran away from home to escape a predetermined future, seeks freedom above all.",
    "Highly skeptical of others' intentions due to a betrayal in their past.",
    "Incredibly patient and observant, a former monk seeking enlightenment through travel.",
    "Once a noble, now a wanderer after losing everything to political intrigue.",
    "Passionate about engineering, left a corporate job to explore the stars.",
    "A former pirate trying to turn over a new leaf, but old habits die hard.",
    "Grew up on the streets, surviving through wit and agility, trusts no one easily.",
    "An academic prodigy who found academic life too stifling and seeks real-world applications.",
    "Fascinated with alien cultures, left an academic career to meet them firsthand.",
    "Haunted by a mysterious event in their past, searching for answers among the stars.",
    "Devoted to a lost cause, travels the galaxy to spread the word and find new hope.",
    "Escaped from a life of servitude, cherishes freedom and helps others find theirs.",
    "A former soldier with a strong sense of duty, struggles with the horrors they witnessed.",
    "Dreams of writing a galactic bestseller, collects unique experiences as material.",
    "A tech whiz who hacked their way off their home planet, seeks to outsmart the galaxy.",
    "Desperate to prove their worth after being deemed a failure by their family.",
    "Has a knack for languages, left academia to learn from the source directly.",
    "A talented healer who believes in the sanctity of life, wishes to see a universe in harmony.",
    "An artist who seeks inspiration in the cosmos, views the galaxy as their canvas.",
    "A gambler who's run out of luck, looking for a fresh start and easy credits.",
    "Seeks redemption for a dark deed, believes helping others can balance the scales.",
    "A thrill-seeker, addicted to the rush of danger, always first to volunteer for risky missions."
]






const attitudes = [
    "Cheerful", "Grumpy", "Optimistic", "Pessimistic", "Friendly", "Hostile",
    "Calm", "Anxious", "Energetic", "Lazy", "Curious", "Indifferent", "Ambitious",
    "Content", "Impulsive", "Cautious", "Loyal", "Detached", "Brave", "Timid", "Stoic",
    "Generous", "Selfish", "Honest", "Deceptive", "Compassionate", "Apathetic", "Moody",
    "Diligent", "Sloppy", "Creative", "Unimaginative", "Witty", "Dull", "Adventurous",
    "Reserved", "Passionate", "Dispassionate", "Sincere", "Sarcastic", "Kind", "Cruel",
]


module.exports = { firstNames, lastNames, appearances, personalities, attitudes };