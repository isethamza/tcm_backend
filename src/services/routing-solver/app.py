# app.py

from flask import Flask, request, jsonify
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
import logging
import os
import time

# =====================================================
# CONFIG
# =====================================================

SERVICE_NAME = "routing-solver"
DEFAULT_TIME_LIMIT = int(os.getenv("SOLVER_TIME_LIMIT", "5"))  # seconds
SERVICE_TIME = int(os.getenv("SERVICE_TIME_MINUTES", "10"))  # per stop

# =====================================================
# LOGGING
# =====================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

logger = logging.getLogger(SERVICE_NAME)

# =====================================================
# APP
# =====================================================

app = Flask(__name__)

# =====================================================
# HEALTH CHECK
# =====================================================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": SERVICE_NAME,
    })


# =====================================================
# SOLVER
# =====================================================

@app.route("/solve", methods=["POST"])
def solve():
    start_time = time.time()

    try:
        data = request.get_json(force=True)

        if not data or "matrix" not in data:
            return jsonify({"error": "Missing 'matrix'"}), 400

        matrix = data["matrix"]

        # ================================
        # VALIDATION
        # ================================

        if not isinstance(matrix, list) or len(matrix) < 2:
            return jsonify({"error": "Matrix must have at least 2 nodes"}), 400

        n = len(matrix)

        for row in matrix:
            if not isinstance(row, list) or len(row) != n:
                return jsonify({"error": "Matrix must be square"}), 400

        logger.info(f"📦 Solving route for {n} nodes")

        # ================================
        # OR-TOOLS SETUP
        # ================================

        manager = pywrapcp.RoutingIndexManager(n, 1, 0)
        routing = pywrapcp.RoutingModel(manager)

        def time_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return matrix[from_node][to_node] + SERVICE_TIME

        transit_callback_index = routing.RegisterTransitCallback(time_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # ================================
        # SEARCH CONFIG
        # ================================

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()

        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )

        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )

        search_parameters.time_limit.seconds = DEFAULT_TIME_LIMIT

        # ================================
        # SOLVE
        # ================================

        solution = routing.SolveWithParameters(search_parameters)

        if solution is None:
            logger.warning("❌ No solution found")
            return jsonify({"error": "No solution found"}), 422

        # ================================
        # EXTRACT ROUTE
        # ================================

        route = []
        index = routing.Start(0)

        while not routing.IsEnd(index):
            route.append(manager.IndexToNode(index))
            index = solution.Value(routing.NextVar(index))

        route.append(manager.IndexToNode(index))

        duration = round(time.time() - start_time, 3)

        logger.info(f"✅ Route solved in {duration}s")

        return jsonify({
            "route": route,
            "meta": {
                "nodes": n,
                "duration_sec": duration,
            },
        })

    except Exception as e:
        logger.exception("💥 Solver error")
        return jsonify({
            "error": "Internal solver error",
            "details": str(e),
        }), 500


# =====================================================
# ENTRYPOINT
# =====================================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", "8000")),
    )