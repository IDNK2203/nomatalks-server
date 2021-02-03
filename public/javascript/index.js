var glide = new Glide(".glide", {
  type: "carousel",
  startAt: 0,
  perView: 1,
  focusAt: 0,
  autoplay: 4000,
  hoverpause: true,
  animationTimingFunc: "ease-in-out",
  animationDuration: 800,
});

glide.mount();
