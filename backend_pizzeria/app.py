from flask import Flask
from flask_cors import CORS
from config import config
from routes.pizzeria import pizzeria_bp, mysql

app = Flask(__name__)
app.config.from_object(config['development'])

CORS(app)
mysql.init_app(app)

app.register_blueprint(pizzeria_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(port=5000)