/* Стобчатый график */
var ctx = document.getElementById('rating').getContext('2d');
var rating = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Обожаю', 'Любимчик', 'Нравится', 'Нейтрально', 'Не нравится', 'Ненавижу'],
        datasets: [{
            label: 'Количество оценок',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: [
                'rgb(180, 0, 250)',
                'rgb(54, 162, 235)',
                'rgb(180, 255, 0)',
                'rgb(255, 216, 0)',
                'rgb(255, 156, 0)',
                'rgb(255, 0, 0)'
            ],
            borderColor: [
                'rgb(180, 0, 250)',
                'rgb(54, 162, 235)',
                'rgb(180, 255, 0)',
                'rgb(255, 216, 0)',
                'rgb(255, 156, 0)',
                'rgb(255, 0, 0)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        },
    responsive: true,
    maintainAspectRatio: false
    }
});