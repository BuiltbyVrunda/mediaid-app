import datetime
from flask import Flask, render_template, request, jsonify, session
from flask_session import Session 
import os
import time 

app = Flask(__name__)


app.config['SECRET_KEY'] = os.urandom(24) 
app.config['SESSION_TYPE'] = 'filesystem' 
app.config['SESSION_FILE_DIR'] = '/tmp/flask_session' 
Session(app)

.
symptom_database = {
    # Critical conditions with gentle approach
    'chest discomfort': {
        'symptoms': ['chest pressure', 'chest pain', 'shortness of breath', 'nausea', 'sweating', 'arm pain', 'jaw pain', 'chest tightness', 'heart racing'],
        'severity': 'critical',
        'gentle_title': 'Chest Discomfort',
        'reassurance': "I understand you're experiencing chest discomfort. This can be concerning, but let's work together to get you the right care.",
        'first_aid': [
            'Find a comfortable position to sit and rest',
            'Try to stay calm and breathe slowly',
            'If you have aspirin and no allergies, you may take one (300mg chewed)',
            'Loosen any tight clothing around your chest',
            'It would be wise to call emergency services (100) or have someone nearby do so',
            'Stay with someone if possible while waiting for help'
        ],
        'questions': [
            'How would you describe the sensation in your chest? (pressure, squeezing, sharp pain?)',
            'When did you first notice this feeling?',
            'Does the discomfort spread to your arm, neck, or jaw?',
            'Are you feeling nauseated or sweaty?',
            'Have you experienced anything like this before?'
        ]
    },
    'sudden weakness': {
        'symptoms': ['facial drooping', 'arm weakness', 'speech problems', 'sudden headache', 'confusion', 'vision problems', 'dizziness', 'numbness'],
        'severity': 'critical',
        'gentle_title': 'Sudden Weakness or Changes',
        'reassurance': "You're experiencing some concerning symptoms. Let's check a few things to help determine the best next steps.",
        'first_aid': [
            'Sit or lie down in a comfortable position',
            'Stay calm and avoid sudden movements',
            'Note what time these symptoms started',
            'It\'s important to seek immediate medical attention by calling 100',
            'If you feel like vomiting, turn your head to the side',
            'Have someone stay with you if possible'
        ],
        'questions': [
            'Try smiling - does one side of your face feel different?',
            'Can you raise both arms equally, or does one feel weaker?',
            'How is your speech - any slurring or difficulty finding words?',
            'When did you first notice these changes?',
            'Are you experiencing any sudden, severe headache?'
        ]
    },
    'breathing difficulty': {
        'symptoms': ['wheezing', 'trouble breathing', 'chest tightness', 'coughing', 'shortness of breath'],
        'severity': 'critical',
        'gentle_title': 'Breathing Difficulty',
        'reassurance': "I can help you through this breathing difficulty. Let's focus on getting you comfortable and breathing easier.",
        'first_aid': [
            'Sit upright in a comfortable position, leaning slightly forward',
            'Try to breathe slowly and deeply',
            'If you have a rescue inhaler, use it as prescribed',
            'Stay calm - anxiety can make breathing feel harder',
            'If breathing doesn\'t improve quickly, call emergency services (100)',
            'Fresh air may help - open a window or step outside if possible'
        ],
        'questions': [
            'Do you have an inhaler or breathing medication with you?',
            'How long have you been having trouble breathing?',
            'Are you hearing any wheezing sounds when you breathe?',
            'Have you been around any triggers like smoke, allergens, or strong scents?',
            'Have you experienced breathing problems like this before?'
        ]
    },
    'severe allergic reaction': {
        'symptoms': ['itching', 'hives', 'swelling', 'wheezing', 'difficulty breathing', 'throat tightness', 'rash', 'nausea'],
        'severity': 'variable',
        'gentle_title': 'Allergic Reaction',
        'reassurance': "Allergic reactions can be managed effectively. Let's assess your symptoms and get you the right care.",
        'first_aid': [
            'Stay calm and try to identify what might have caused this',
            'If you have an EpiPen, use it if symptoms are severe',
            'For mild reactions, an antihistamine like Benadryl may help',
            'Remove yourself from the allergen if known',
            'If you\'re having trouble breathing or swallowing, call 100 immediately',
            'Sit upright if breathing is difficult'
        ],
        'questions': [
            'Are you having any difficulty breathing or swallowing?',
            'Do you have an EpiPen or allergy medication with you?',
            'What do you think might have triggered this reaction?',
            'How quickly did these symptoms develop?',
            'Have you had severe allergic reactions in the past?'
        ]
    },
    'injury or trauma': {
        'symptoms': ['bleeding', 'pain', 'swelling', 'deformity', 'bruising', 'cuts', 'burns'],
        'severity': 'variable',
        'gentle_title': 'Injury',
        'reassurance': "I'm here to help you care for your injury. Let's take this step by step to ensure proper treatment.",
        'first_aid': [
            'First, try to stay calm and assess the injury',
            'For bleeding: apply gentle, direct pressure with a clean cloth',
            'For burns: cool the area with running water for 10-20 minutes',
            'For suspected fractures: don\'t move the injured area',
            'Elevate injured limbs if possible and comfortable',
            'Seek medical attention for deep cuts, severe burns, or suspected fractures'
        ],
        'questions': [
            'What type of injury occurred?',
            'How did the injury happen?',
            'Are you experiencing severe pain (rate 1-10)?',
            'Is there any active bleeding?',
            'Can you move the injured area normally?'
        ]
    },
    # Moderate conditions
    'feeling faint': {
        'symptoms': ['dizziness', 'lightheadedness', 'weakness', 'nausea', 'sweating', 'blurred vision'],
        'severity': 'moderate',
        'gentle_title': 'Feeling Faint or Dizzy',
        'reassurance': "Feeling faint can be unsettling, but it's often manageable. Let's help you feel more stable.",
        'first_aid': [
            'Sit or lie down immediately in a safe place',
            'If lying down, elevate your legs slightly',
            'Loosen any tight clothing',
            'Take slow, deep breaths',
            'Stay hydrated with small sips of water',
            'Rest until you feel completely better before standing'
        ]
    },
    'anxiety or panic': {
        'symptoms': ['rapid heartbeat', 'fear', 'shortness of breath', 'sweating', 'trembling', 'chest tightness'],
        'severity': 'moderate',
        'gentle_title': 'Anxiety or Panic',
        'reassurance': "What you're experiencing is real and manageable. Let's work together to help you feel calmer.",
        'first_aid': [
            'Find a quiet, comfortable place to sit',
            'Practice slow, deep breathing - in for 4, hold for 4, out for 6',
            'Focus on your surroundings - name 5 things you can see',
            'Remind yourself that this feeling will pass',
            'If symptoms persist or worsen, consider calling a helpline or doctor',
            'Try progressive muscle relaxation'
        ]
    },
    'stomach issues': {
        'symptoms': ['nausea', 'vomiting', 'diarrhea', 'stomach pain', 'cramping', 'bloating'],
        'severity': 'mild-moderate',
        'gentle_title': 'Stomach Discomfort',
        'reassurance': "Stomach issues are common and usually manageable. Let's help you feel more comfortable.",
        'first_aid': [
            'Rest and avoid solid foods for now',
            'Stay hydrated with small, frequent sips of clear fluids',
            'Try ginger tea or peppermint for nausea',
            'When ready, start with bland foods like toast or bananas',
            'Consider over-the-counter remedies if appropriate',
            'Monitor symptoms and seek care if they worsen or persist'
        ]
    },
    # Mild conditions
    'cold or flu symptoms': {
        'symptoms': ['runny nose', 'congestion', 'sneezing', 'sore throat', 'mild fever', 'body aches', 'fatigue'],
        'severity': 'mild',
        'gentle_title': 'Cold or Flu Symptoms',
        'reassurance': "These symptoms are your body's way of fighting off illness. With proper care, you should feel better soon.",
        'first_aid': [
            'Get plenty of rest - your body heals while you sleep',
            'Stay well-hydrated with water, herbal teas, and warm broths',
            'Use a humidifier or breathe steam from a hot shower',
            'Take over-the-counter medications as needed for comfort',
            'Eat nourishing foods when you feel up to it',
            'Give yourself time to recover fully'
        ]
    },
    'headache': {
        'symptoms': ['head pain', 'pressure', 'tension', 'sensitivity to light', 'neck stiffness'],
        'severity': 'mild-moderate',
        'gentle_title': 'Headache',
        'reassurance': "Headaches are very common and usually respond well to simple treatments. Let's help you feel better.",
        'first_aid': [
            'Rest in a quiet, dimly lit room',
            'Apply a cold or warm compress to your head or neck',
            'Stay hydrated and avoid dehydration',
            'Try gentle neck and shoulder stretches',
            'Consider over-the-counter pain relief if needed',
            'Practice relaxation techniques like deep breathing'
        ]
    },
    'skin issues': {
        'symptoms': ['rash', 'itching', 'redness', 'swelling', 'dry skin', 'irritation'],
        'severity': 'mild',
        'gentle_title': 'Skin Irritation',
        'reassurance': "Skin issues can be uncomfortable, but they're usually treatable. Let's help soothe your skin.",
        'first_aid': [
            'Gently clean the affected area with mild soap and water',
            'Apply a cool, damp cloth for comfort',
            'Use fragrance-free moisturizer if skin is dry',
            'Avoid scratching to prevent further irritation',
            'Consider antihistamines for itching',
            'Watch for signs of infection or worsening'
        ]
    }
}

def analyze_user_input(user_input):
    """
    Analyzes the user's input to find the best matching medical condition.
    It scores conditions based on direct matches and symptom keywords.
    """
    normalized_input = user_input.lower()
    matched_conditions = []

    for condition, data in symptom_database.items():
        score = 0

       
        if condition in normalized_input:
            score += 10

    
        for symptom in data['symptoms']:
            if symptom.lower() in normalized_input:
                score += 5

        input_words = normalized_input.split(' ')
        for symptom_keyword in data['symptoms']:
            symptom_words = symptom_keyword.lower().split(' ')
            for word in input_words:
                for symptom_word in symptom_words:
                    if len(word) > 3 and (symptom_word in word or word in symptom_word):
                        score += 2

        if score > 0:
            matched_conditions.append({'condition': condition, 'data': data, 'score': score})

    # Sort by score to get the best match
    matched_conditions.sort(key=lambda x: x['score'], reverse=True)

    return matched_conditions[0] if matched_conditions else None

def get_critical_questions(condition):
    """
    Retrieves follow-up questions for a given critical condition.
    """
    condition_data = symptom_database.get(condition)
    return condition_data['questions'] if condition_data and 'questions' in condition_data else [
        "Can you tell me more about when this started?",
        "How would you rate your discomfort on a scale of 1-10?",
        "Have you experienced anything like this before?",
        "Are there any other symptoms you're noticing?"
    ]

def assess_risk_after_questions(condition, responses):
    """
    Assesses the risk level of a condition based on user's responses to follow-up questions.
    """
    condition_data = symptom_database.get(condition)
    if not condition_data:
        return 'moderate'

    response_text = " ".join(responses.values()).lower()
    risk_score = 0

    critical_indicators = ['severe', '10', '9', 'worse', "can't", 'unable', 'emergency']
    moderate_indicators = ['moderate', '7', '8', 'concerning', 'worried', 'getting worse']
    mild_indicators = ['mild', '1', '2', '3', 'better', 'improving', 'manageable']

    for indicator in critical_indicators:
        if indicator in response_text:
            risk_score += 3

    for indicator in moderate_indicators:
        if indicator in response_text:
            risk_score += 2

    for indicator in mild_indicators:
        if indicator in response_text:
            risk_score -= 1

    if risk_score >= 5:
        return 'critical'
    if risk_score >= 2:
        return 'moderate'
    return 'mild'

def get_gentle_response(match_result, is_reassessed=False):
    """
    Constructs a gentle and supportive response based on the matched condition
    and its severity.
    """
    if not match_result:
        return {
            'message': "I want to help you, but I need a bit more information to provide the best guidance. Could you describe what you're experiencing in more detail? Even if it seems minor, I'm here to support you.",
            'steps': [
                "Take your time to describe your symptoms",
                "Focus on what's most concerning to you",
                "Consider when symptoms started and how they've changed",
                "Remember that seeking help is always the right choice when you're worried"
            ],
            'severity': 'mild',
            'show_emergency': False,
            'needs_questioning': False,
            'gentle_title': 'General Guidance'
        }

    condition = match_result['condition']
    data = match_result['data']
    severity = data['severity'] if data['severity'] != 'variable' else 'moderate'

    message = data.get('reassurance', "I'm here to help you with this situation. ")

    if severity == 'critical':
        message += (
            "Based on what you've shared, I believe it's important to seek immediate medical attention. "
            "This doesn't mean you should panic - medical professionals are trained to handle these situations and can help you feel better."
        ) if is_reassessed else (
            "Let me ask you a few gentle questions to better understand your situation and provide the most appropriate guidance."
        )
    elif 'moderate' in severity: 
        message += (
            "From what you've told me, this seems like something that would benefit from medical attention, "
            "though it may not be an emergency. You're taking the right steps by seeking guidance."
        ) if is_reassessed else (
            "Here are some supportive steps that can help you feel more comfortable:"
        )
    else: # mild
        message += (
            "This sounds like something that can be managed well with proper self-care. "
            "You're doing the right thing by paying attention to your body."
        ) if is_reassessed else (
            "This is something many people experience, and there are effective ways to help you feel better:"
        )

    return {
        'message': message,
        'steps': data['first_aid'],
        'severity': 'critical' if 'critical' in severity else ('moderate' if 'moderate' in severity else 'mild'),
        'show_emergency': 'critical' in severity,
        'needs_questioning': not is_reassessed and 'critical' in severity and 'questions' in data,
        'gentle_title': data.get('gentle_title', condition.replace('_', ' ').title())
    }


@app.route('/')
def index():
    """Serves the main HTML page."""
 
    if 'questioning_mode' not in session:
        session['questioning_mode'] = None
    if 'question_index' not in session:
        session['question_index'] = 0
    if 'user_responses' not in session:
        session['user_responses'] = {}
    

    initial_bot_message = {
        'type': 'bot',
        'content': "Hi! I'm MediAid, your caring health companion. I'm here to help you understand your symptoms and guide you through appropriate care steps. Please describe what you're experiencing, and I'll provide gentle, supportive guidance. Remember, I'm here to support you alongside professional medical care, not replace it.",
        'timestamp': datetime.datetime.now().isoformat(), 
        'severity': 'mild',
        'gentleTitle': 'Welcome'
    }
    return render_template('index.html', initial_message=initial_bot_message)




@app.route('/classify', methods=['POST'])
def classify():
    """
    Endpoint for frontend to classify symptoms and get bot response.
    """
    symptoms = request.json.get('symptoms', '').strip()
    match_result = analyze_user_input(symptoms)
    response_data = get_gentle_response(match_result)

    return jsonify({
        'message': response_data['message'],
        'first_aid': response_data['steps'],
        'classification': response_data['severity'],
        'reassurance': response_data['message']
    })



@app.route('/chat', methods=['POST'])
def chat():
    """Handles chat messages from the frontend."""
    user_input = request.json.get('message', '').strip()
    

    time.sleep(1.5)

    if not user_input:
        return jsonify({
            'type': 'bot',
            'content': "Please type your symptoms or a question so I can help.",
            'severity': 'mild',
            'timestamp': datetime.datetime.now().isoformat(),
            'gentleTitle': 'Guidance'
        })

    questioning_mode = session.get('questioning_mode')
    question_index = session.get('question_index', 0)
    user_responses = session.get('user_responses', {})

    bot_response = {}

    if questioning_mode:
       
        user_responses[question_index] = user_input
        session['user_responses'] = user_responses # Update session

        questions = get_critical_questions(questioning_mode)

        if question_index + 1 < len(questions):
         
            session['question_index'] = question_index + 1
            next_question_content = questions[question_index + 1]
            bot_response = {
                'type': 'bot',
                'content': next_question_content,
                'isQuestion': True,
                'timestamp': datetime.datetime.now().isoformat(),
                'gentleTitle': symptom_database[questioning_mode]['gentle_title'] 
            }
        else:
           
            reassessed_severity = assess_risk_after_questions(questioning_mode, user_responses)
            match_result = {'condition': questioning_mode, 'data': symptom_database[questioning_mode]}
            response_data = get_gentle_response(match_result, is_reassessed=True)

            bot_response = {
                'type': 'bot',
                'content': response_data['message'],
                'severity': reassessed_severity,
                'steps': response_data['steps'],
                'showEmergency': response_data['show_emergency'],
                'condition': questioning_mode,
                'gentleTitle': response_data['gentle_title'],
                'timestamp': datetime.datetime.now().isoformat()
            }

         
            session['questioning_mode'] = None
            session['question_index'] = 0
            session['user_responses'] = {}
    else:
      
        match_result = analyze_user_input(user_input)
        response_data = get_gentle_response(match_result)

        if response_data['needs_questioning']:
        
            session['questioning_mode'] = match_result['condition']
            session['question_index'] = 0 
            session['user_responses'] = {} 

            
            initial_critical_message = {
                'type': 'bot',
                'content': response_data['message'],
                'severity': response_data['severity'],
                'condition': match_result['condition'],
                'gentleTitle': response_data['gentle_title'],
                'timestamp': datetime.datetime.now().isoformat()
            }
            
            questions = get_critical_questions(match_result['condition'])
            if questions:
                session['question_index'] = 0 
                first_question_content = questions[0]
                bot_response = {
                    'type': 'bot',
                    'content': first_question_content,
                    'isQuestion': True,
                    'timestamp': datetime.datetime.now().isoformat(),
                    'gentleTitle': response_data['gentle_title'] 
                }
                
                return jsonify([initial_critical_message, bot_response])
            else:
                
                bot_response = {
                    'type': 'bot',
                    'content': "No specific questions found, providing general advice. " + response_data['message'],
                    'severity': response_data['severity'],
                    'steps': response_data['steps'],
                    'showEmergency': response_data['show_emergency'],
                    'gentleTitle': response_data['gentle_title'],
                    'timestamp': datetime.datetime.now().isoformat()
                }
        else:
            
            bot_response = {
                'type': 'bot',
                'content': response_data['message'],
                'severity': response_data['severity'],
                'steps': response_data['steps'],
                'showEmergency': response_data['show_emergency'],
                'condition': match_result['condition'] if match_result else None,
                'gentleTitle': response_data['gentle_title'],
                'timestamp': datetime.datetime.now().isoformat()
            }
    
    return jsonify(bot_response)

if __name__ == '__main__':
    
    if not os.path.exists(app.config['SESSION_FILE_DIR']):
        os.makedirs(app.config['SESSION_FILE_DIR'])
    app.run(debug=True) 
