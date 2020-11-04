# demo-storage

Demo stateful application on k8s

## Thông tin ứng dụng

Biến môi trường:

- `PORT`: 3000

Docker image:

- `minhpq331/demo-storage:latest`

Session của ứng dụng được lưu tại:

- `/tmp/session`

## Cấu hình thường gặp

**Volume mount:** Map từ 1 volume của pod thành volume của container, gắn với từng **container** được định nghĩa trong từng container

```yaml
spec:
  template:
    spec:
      containers:
        - name: web

          volumeMounts:
            - mountPath: "/tmp/session"
              name: storage-volume
```

**Volumes:** Định nghĩa volume share trong pod, gắn với từng **pod**, được định nghĩa trong pod

```yaml
spec:
  template:
    spec:
      containers:
        - name: web

      volumes:
        - name: storage-volume
          emptyDir: {}
```

**Persistent volume:** Tạo ra 1 tài nguyên của cluster cho pod sử dụng, resource của cluster tương tự `nodes` KHÔNG CÓ namespace

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: deployment-volume
spec:
  storageClassName: manual
  capacity:
    storage: 20Mi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/data/data-1"
```

**Persistent volume claim:** Request từ 1 pod tới tài nguyên cluster (cầu nối giữa `volumes` của pod và `persistent volumes` của cluster)

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: deployment-claim
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Mi
```

## Thực hành 1: Deployment with pod volume

- Mở file `ingress.yaml` và sửa lại domain (nếu không sẽ trùng với người khác)
- Deploy ứng dụng NodeJS với session lên bằng các lệnh sau:

```bash
# Deploy dạng deployment
kubectl -n <ns> apply -f deployment.yaml

# Deploy service and ingress
kubectl -n <ns> apply -f service.yaml
kubectl -n <ns> apply -f ingress.yaml
```

- Check ứng dụng đã chạy thành công bằng `kubectl -n <ns> get pod`
- Check Persistent volume và Persistent volume claim đã chuyển sang trạng thái "Bound"
- Check ứng dụng chạy thành công trên `http://<domain>:32080`
- Refresh 1 vài lần để kiểm tra kết quả
- Thử restart deployment bằng câu lệnh:

```bash
kubectl -n <ns> rollout restart deployment demo-storage
```

- Kiểm tra lại trên web xem giá trị session hiện tại là bao nhiêu

## Thực hành 2: Deployment with multiple instance

- Sửa file `deployment.yaml` và tăng replicas thành 2
- Apply lại deployment:

```bash
# Deploy dạng deployment
kubectl -n <ns> apply -f deployment.yaml
```
- Kiểm tra lại trên web xem giá trị session hiện tại là bao nhiêu

## Thực hành 3: Deployment with shared persistent volume

- Mở file `volume_deployment.yaml` và sửa lại name và hostPath của persistent volume (vì giá trị này có giá trị của cả cluster nên sẽ trùng với người khác)
- Mở file `deployment.yaml`, sửa lại replicas thành 1 và phần volume như sau:

```yaml
volumes:
  - name: storage-volume
    emptyDir: {}
    # persistentVolumeClaim:
    #  claimName: deployment-claim
```

Sửa lại thành:

```yaml
volumes:
  - name: storage-volume
    # emptyDir: {}
    persistentVolumeClaim:
     claimName: deployment-claim
```

- Apply volume và deployment:

```bash
# Deploy volume
kubectl -n <ns> apply -f volume-deployment.yaml

# Deploy dạng deployment
kubectl -n <ns> apply -f deployment.yaml
```

- Vào web 1 vài lần để cập nhật session
- Restart deployment

```bash
kubectl -n <ns> rollout restart deployment demo-storage
```

