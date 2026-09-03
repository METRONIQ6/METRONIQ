import os, sys, subprocess
cmd = [
    'docker', 'run', '--rm', 
    '-v', f'{os.getcwd()}:/app/workspace', 
    '-w', '/app/workspace', 
    'metroniq-ai:latest', 
    'python', 'backend/mlops/dataset/expand_dataset_pull.py', '40'
]
res = subprocess.run(cmd, capture_output=True, text=True)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
