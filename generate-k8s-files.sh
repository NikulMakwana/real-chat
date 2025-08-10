#!/bin/bash

# Create namespace file
cat > k8s/config/namespace.yaml <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: chat-app
EOF

# MongoDB files
cat > k8s/deployments/mongodb-deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: chat-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:6
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: root
        - name: MONGO_INITDB_ROOT_PASSWORD
          value: chatdb123
        volumeMounts:
        - name: mongodb-data
          mountPath: /data/db
EOF

cat > k8s/services/mongodb-service.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: mongodb
  namespace: chat-app
spec:
  selector:
    app: mongodb
  ports:
  - protocol: TCP
    port: 27017
    targetPort: 27017
EOF

cat > k8s/volumes/mongodb-pvc.yaml <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
  namespace: chat-app
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
EOF

# Redis files
cat > k8s/deployments/redis-deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: chat-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
EOF

cat > k8s/services/redis-service.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: chat-app
spec:
  selector:
    app: redis
  ports:
  - protocol: TCP
    port: 6379
    targetPort: 6379
EOF

# Backend files
cat > k8s/deployments/backend-deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: chat-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-backend-image
        ports:
        - containerPort: 4000
        env:
        - name: MONGODB_URI
          value: "mongodb://root:chatdb123@mongodb:27017/chatdb?authSource=admin"
        - name: REDIS_URL
          value: "redis://redis:6379"
        - name: FRONTEND_URL
          value: "http://frontend:80"
EOF

cat > k8s/services/backend-service.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: chat-app
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 4000
    targetPort: 4000
EOF

# Frontend files
cat > k8s/deployments/frontend-deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: chat-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-frontend-image
        ports:
        - containerPort: 80
        env:
        - name: REACT_APP_BACKEND_URL
          value: "http://backend:4000"
EOF

cat > k8s/services/frontend-service.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: chat-app
spec:
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
EOF

cat > k8s/config/ingress.yaml <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: frontend-ingress
  namespace: chat-app
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
EOF

echo "Kubernetes files generated in k8s directory!"