from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

# Lokasi tanpa menentukan kendaraan
locations = {
    "Hotel 1": (-7.290, 112.738),
    "Hotel 2": (-7.297, 112.734),
    "Hotel 3": (-7.284, 112.752),
    "Fakultas Teknik Industri": (-7.285163, 112.796003),
    "Fakultas Teknik Elektro": (-7.283163, 112.798003),
    "Fakultas Komputer": (-7.281163, 112.795803),
    "Fakultas Teknik Mesin": (-7.286163, 112.794003),
    "Fakultas Desain dan Seni": (-7.288163, 112.792003),
    "Apartement Educity Tower Y-P-H By Prafi": (-7.271413801548055, 112.80716829264938),
    "Frank's Hotel": (-7.260325462811474, 112.79558793780397),
    "OYO 90143 Gosepa Keputih Syariah": (-7.28922905937865, 112.80396784766772),
    "Oakwood Hotel & Residence Surabaya": (-7.279689109431955, 112.78112011087363),
}

def heuristic(a, b):
    lat1, lon1 = locations[a]
    lat2, lon2 = locations[b]
    return math.sqrt((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2)

def a_star_search(start, goal, vehicle):
    open_list = [(0, start)]
    g_costs = {start: 0}
    came_from = {}

    while open_list:
        current_cost, current_node = open_list.pop(0)

        if current_node == goal:
            path = []
            while current_node in came_from:
                path.append(current_node)
                current_node = came_from[current_node]
            path.append(start)
            path.reverse()
            return path, current_cost

        for neighbor in locations:
            if neighbor == current_node:
                continue

            # Simulasikan logika pembatasan jalur untuk kendaraan tertentu
            if vehicle == "mobil" and "Fakultas Teknik Industri" in [neighbor, current_node]:
                continue  # Contoh: Mobil tidak bisa melewati lokasi ini

            tentative_g_cost = g_costs[current_node] + heuristic(current_node, neighbor)
            if neighbor not in g_costs or tentative_g_cost < g_costs[neighbor]:
                g_costs[neighbor] = tentative_g_cost
                f_cost = tentative_g_cost + heuristic(neighbor, goal)
                open_list.append((f_cost, neighbor))
                came_from[neighbor] = current_node
                open_list.sort(key=lambda x: x[0])

    return None, None

@app.route('/')
def beranda():
    total_initial_states = len(locations) - 1
    total_goal_states = 1
    return render_template('beranda.html', locations=locations, total_initial_states=total_initial_states, total_goal_states=total_goal_states)

@app.route('/calculate_route', methods=['GET'])
def calculate_route():
    start = request.args.get('start')
    goal = request.args.get('goal')
    vehicle = request.args.get('vehicle')  # Kendaraan

    if start not in locations or goal not in locations:
        return jsonify({'error': 'Invalid locations'}), 400

    path, cost = a_star_search(start, goal, vehicle)
    if path:
        return jsonify({'path': path, 'cost': cost})
    else:
        return jsonify({'error': f'No path found for vehicle type: {vehicle}'}), 404

@app.route('/hotel/<hotel_name>')
def detail_hotel(hotel_name):
    coordinates = locations.get(hotel_name)
    return render_template('detail_hotel.html', hotel_name=hotel_name, coordinates=coordinates)

if __name__ == '__main__':
    app.run(debug=True)
