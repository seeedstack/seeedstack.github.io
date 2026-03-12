from flask import Flask, render_template, request, jsonify
from flask_mail import Mail, Message
from config import Config

app = Flask(__name__)
app.config.from_object('config.Config')
mail = Mail(app)


@app.route('/')
def base():
    return render_template("base.html")


@app.route('/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json()
    email = data.get('email', '').strip()

    if not email or '@' not in email:
        return jsonify({'success': False, 'message': 'Invalid email.'})

    try:
        msg = Message(
            subject='🚀 New LYNK Waitlist Signup',
            recipients=[Config.MAIL_RECEIVERS],
            body=f'New early access request from: {email}'
        )
        mail.send(msg)
        return jsonify({'success': True})
    except Exception as e:
        print(f'Mail error: {e}')
        return jsonify({'success': False, 'message': 'Failed to send. Try again.'})


if __name__ == '__main__':
    app.run(debug=True, port=5010)
