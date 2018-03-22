import { Injectable } from '@angular/core';
declare var $: any;
declare var WOW: any;
@Injectable()
export class MaterialscriptService {
  constructor() { }
  material() {
    $("input.form-control, textarea.form-control, input.selection").blur(function () {
      console.log($(this).val());
      if ($(this).val() == '') {
        $(this).parents('.form-group').removeClass('focused').children('label').removeClass('focused');
      }
    });
    $("input.form-control, textarea.form-control,input.selection").focus(function () {
      $(this).parents('.form-group').addClass('focused').children('label').addClass('focused');
    });
    $("input.form-control, textarea.form-control,input.selection").each(function () {
      console.log($(this).val());
      if ($(this).val() == '') {
        $(this).parents('.form-group').removeClass('focused').children('label').removeClass('focused');
      }
      else {
        $(this).parents('.form-group').addClass('focused').children('label').addClass('focused');
      }
    });
    $(".custom-select-trigger").blur(function () {
      if ($(this).parents('.custom-select').val() == '') {
        $(this).parents('.form-group').removeClass('focused').children('label').removeClass('focused');
      }
    });
    $(".btn-reset").click(function () {
      $("input.form-control, textarea.form-control,input.selection").each(function () {
        console.log($(this).val());
        if ($(this).val() == '') {
          $(this).parents('.form-group').removeClass('focused').children('label').removeClass('focused');
        }
        else {
          $(this).parents('.form-group').addClass('focused').children('label').addClass('focused');
        }
      });
    });
  }

  selectMaterial() {
    $(".custom-select").each(function () {
      var classes = $(this).attr("class"),
        id = $(this).attr("id"),
        placeHolder = "&nbsp;",
        name = $(this).attr("name");
      if ($(this).attr("placeholder")) {
        placeHolder = $(this).attr("placeholder");
      }
      var template = '<div class="' + classes + '">';
      template += '<span class="custom-select-trigger">' + placeHolder + '</span>';
      template += '<div class="custom-options">';
      $(this).find("option").each(function () {
        template += '<span class="custom-option ' + $(this).attr("class") + '" data-value="' + $(this).attr("value") + '">' + $(this).html() + '</span>';
      });
      template += '</div></div>';

      $(this).wrap('<div class="custom-select-wrapper"></div>');
      $(this).hide();
      $(this).after(template);
    });
    $(".custom-option:first-of-type").hover(function () {
      $(this).parents(".custom-options").addClass("option-hover");
    }, function () {
      $(this).parents(".custom-options").removeClass("option-hover");
    });
    $(".custom-select-trigger").on("click", function () {
      $('html').one('click', function () {
        $(".custom-select").removeClass("opened");
      });
      $(this).parents(".custom-select").toggleClass("opened");
      event.stopPropagation();
    });
    $(".custom-option").on("click", function () {
      $(this).parents(".custom-select-wrapper").find("select").val($(this).data("value"));
      $(this).parents(".custom-options").find(".custom-option").removeClass("selection");
      $(this).addClass("selection");
      $(this).parents(".custom-select").removeClass("opened");
      $(this).parents(".custom-select").find(".custom-select-trigger").text($(this).text());
    });
    $('select.form-control').parent('.form-group').children('label').addClass('focused');
    $(".custom-select-trigger").click(function () {
      $(this).parents('.form-group').addClass('focused').children('label').addClass('focused');
    });
  }
}
